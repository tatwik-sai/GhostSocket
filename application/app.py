import customtkinter as ctk
import webbrowser
import re
from tkinter import simpledialog
from storage import Storage
import asyncio
import aiohttp
import threading
from PIL import Image, ImageDraw, ImageTk
from config import *
import os
import requests
import subprocess 
from sender import connect_socket, disconnect_socket

def get_uuid():
    try:
        result = subprocess.check_output(
            ['powershell', '-Command', '(Get-CimInstance -Class Win32_ComputerSystemProduct).UUID'],
            stderr=subprocess.DEVNULL
        ).decode().strip()
        return result
    except Exception as e:
        return f"Error: {e}"

uuid = get_uuid()
print(f"System UUID: {uuid}")

async def post_data(url, payload):
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload) as response:
            data = await response.json()
            return [response.status, data]

class AsyncLoopThread:
    def __init__(self):
        self.loop = asyncio.new_event_loop()
        self.thread = threading.Thread(target=self._start_loop, daemon=True)
        self.thread.start()

    def _start_loop(self):
        asyncio.set_event_loop(self.loop)
        self.loop.run_forever()

    def run_coroutine(self, coro):
        return asyncio.run_coroutine_threadsafe(coro, self.loop)

async_loop = AsyncLoopThread()
storeage = Storage("ghost_socket")
stored_data = storeage.get_data()

class Toast:
    def __init__(self, parent):
        self.parent = parent
        self._toast_widget = None

    def show(self, message: str, duration: int = 2500, type: str = "info"):
        if self._toast_widget and self._toast_widget.winfo_exists():
            self._toast_widget.destroy()

        # Unified background color
        fg_color = "#2b2b2b"  # dark theme neutral

        # Icon mapping
        icon_paths = {
            "success": "assets/success.png",
            "error": "assets/error.png",
            "warning": "assets/warning.png",
            "info": "assets/info.png"
        }

        # Load icon image
        icon_path = icon_paths.get(type, icon_paths["info"])
        image = Image.open(icon_path).resize((20, 20), Image.Resampling.LANCZOS)
        icon = ctk.CTkImage(light_image=image, dark_image=image, size=(20, 20))
        # Toast frame
        frame = ctk.CTkFrame(self.parent, fg_color=fg_color, corner_radius=12)
        self._toast_widget = frame
        # Icon + Label
        icon_label = ctk.CTkLabel(frame, image=icon, text="")
        icon_label.pack(side="left", padx=(10, 6))

        msg_label = ctk.CTkLabel(
            frame,
            text=message,
            font=ctk.CTkFont(size=12, weight="bold"),
            text_color="white"
        )
        msg_label.pack(side="left", padx=6, pady=10)

        frame.place(relx=0.5, y=-50, anchor="n")  # start off-screen
        self._slide_in(frame, target_y=30)
        frame.after(duration, lambda: self._slide_out(frame))

    def _slide_in(self, toast, y=-50, target_y=30, step=5):
        if y < target_y:
            toast.place_configure(y=y)
            toast.after(10, lambda: self._slide_in(toast, y + step, target_y))
        else:
            toast.place_configure(y=target_y)

    def _slide_out(self, toast, y=None, step=5):
        if y is None:
            y = int(toast.winfo_y())
        if y > -50:
            toast.place_configure(y=y)
            toast.after(10, lambda: self._slide_out(toast, y - step))
        else:
            toast.destroy()

class App(ctk.CTk):
    def __init__(self, is_logged_in: bool = False, show_home_page=None):
        super().__init__()
        self.title("Ghost Socket")
        self.geometry("800x600")
        self.resizable(False, False)
        self.show_home_page = show_home_page

        # Container to hold all pages
        self.container = ctk.CTkFrame(self)
        self.container.pack(fill="both", expand=True)

        # ✨ Fix: allow pages to expand inside container
        self.container.grid_rowconfigure(0, weight=1)
        self.container.grid_columnconfigure(0, weight=1)

        # Dictionary to store pages
        self.pages = {}

        for Page in (LoginPage, HomePage, OtpPage, PasswordPage, LoadingPage):
            page = Page(self.container, self)
            self.pages[Page] = page
            page.grid(row=0, column=0, sticky="nsew")  # fills container

        if is_logged_in:
            self.show_page(LoadingPage)
            async_loop.run_coroutine(show_home_page(self))
        else:
            self.show_page(LoginPage)

    def show_page(self, page_class):
        page = self.pages[page_class]
        page.tkraise()

class LoadingPage(ctk.CTkFrame):
    def __init__(self, parent, controller=None):
        super().__init__(parent)
        self.controller = controller
        self.toast = Toast(self)
        self.dot_labels = []
        self.current_index = 0

        # Main container
        container = ctk.CTkFrame(self, fg_color="transparent")
        container.pack(expand=True)

        # "Loading" text
        title = ctk.CTkLabel(container, text="Loading...", font=ctk.CTkFont(size=22, weight="bold"))
        title.pack(pady=20)

        # Dot animation container
        dot_frame = ctk.CTkFrame(container, fg_color="transparent")
        dot_frame.pack()

        for i in range(3):
            lbl = ctk.CTkLabel(dot_frame, text="●", font=ctk.CTkFont(size=28), text_color="#555555")
            lbl.pack(side="left", padx=6)
            self.dot_labels.append(lbl)

        self.animate_dots()

    def animate_dots(self):
        for i, label in enumerate(self.dot_labels):
            label.configure(text_color="#d63031" if i == self.current_index else "#555555")

        self.current_index = (self.current_index + 1) % 3
        self.after(300, self.animate_dots)

class LoginPage(ctk.CTkFrame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.toast = Toast(self)
        self.controller = controller

        # Centering wrapper
        wrapper = ctk.CTkFrame(self, fg_color="transparent")
        wrapper.place(relx=0.5, rely=0.5, anchor="center")

        # Title
        ctk.CTkLabel(wrapper, text="🔐 Welcome Back", font=ctk.CTkFont(size=26, weight="bold")).pack(pady=(10, 6))
        ctk.CTkLabel(wrapper, text="Login to continue", font=ctk.CTkFont(size=14), text_color="gray").pack(pady=(0, 25))

        # Email Entry
        self.email_entry = ctk.CTkEntry(wrapper, placeholder_text="Email", width=300, height=40, corner_radius=10)
        self.email_entry.pack(pady=(10, 2))

        # 🔔 Instruction Note
        ctk.CTkLabel(
            wrapper,
            text="Enter the email linked to your GhostSocket account.",
            font=ctk.CTkFont(size=12),
            text_color="gray"
        ).pack(pady=(0, 15))

        # Login Button
        self.login_button = ctk.CTkButton(
            wrapper,
            text="Login",
            command=self.async_handle_login,
            fg_color="#d63031",  # Red
            hover_color="#e17055",
            text_color="white",
            width=300,
            height=40,
            corner_radius=10
        )
        self.login_button.pack(pady=12)

        # OR Divider
        ctk.CTkLabel(wrapper, text="──────── or ────────", text_color="gray").pack(pady=(10, 5))

        # Signup Button
        signup_button = ctk.CTkButton(
            wrapper,
            text="Sign Up",
            command=self.open_signup,
            fg_color="#d63031",
            hover_color="#e17055",
            text_color="white",
            width=300,
            height=40,
            corner_radius=10
        )
        signup_button.pack(pady=8)

    def async_handle_login(self):
        async_loop.run_coroutine(self.handle_login())

    async def handle_login(self):
        self.login_button.configure(state="disabled", text="Logging in...")
        email = self.email_entry.get()

        # Email format check
        if not self.is_valid_email(email):
            self.toast.show("Please enter a valid email address.", type="error")
            self.login_button.configure(state="normal", text="Login")
            return

        status, data = None, None
        try:
            status, data = await post_data(CHECK_USER_URL, {"email": email})
        except Exception as e:
            self.toast.show("Error checking user", type="error")
            self.login_button.configure(state="normal", text="Login")
            return
        
        if status == 200:
            if data["type"] == "otp":
                self.email_entry.delete(0, "end")
                OtpPage.email = email
                self.controller.show_page(OtpPage)
            elif data["type"] == "email_password":
                self.email_entry.delete(0, "end")
                PasswordPage.email = email
                self.controller.show_page(PasswordPage)
        else:
            self.toast.show(data.get("message", "Unknown error occurred."), type="error")
        self.login_button.configure(state="normal", text="Login")

    def is_valid_email(self, email):
        pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        return re.match(pattern, email)

    def open_signup(self):
        webbrowser.open(SIGNUP_BASE)

class OtpPage(ctk.CTkFrame):
    email = None
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller
        self.toast = Toast(self)

        wrapper = ctk.CTkFrame(self, fg_color="transparent")
        wrapper.place(relx=0.5, rely=0.5, anchor="center")

        ctk.CTkLabel(wrapper, text="🔐 Enter OTP", font=ctk.CTkFont(size=24, weight="bold")).pack(pady=(10, 6))
        ctk.CTkLabel(wrapper, text="Check your email for the 6-digit code.", font=ctk.CTkFont(size=14), text_color="gray").pack(pady=(0, 25))

        # OTP Entry Fields
        otp_frame = ctk.CTkFrame(wrapper, fg_color="transparent")
        otp_frame.pack(pady=(0, 20))

        self.otp_boxes = []
        for i in range(6):
            entry = ctk.CTkEntry(
                otp_frame,
                width=40,
                height=50,
                font=ctk.CTkFont(size=20),
                justify='center'
            )
            entry.pack(side="left", padx=5)
            entry.bind("<KeyRelease>", lambda e, idx=i: self.on_key_release(e, idx))
            entry.bind("<KeyPress>", self.on_key_press)
            self.otp_boxes.append(entry)

        # Submit Button
        self.submit_button = ctk.CTkButton(
            wrapper,
            text="Verify OTP",
            command=self.async_submit_otp,
            fg_color="#d63031",
            hover_color="#e17055",
            text_color="white",
            width=280,
            height=45,
            corner_radius=12
        )
        self.submit_button.pack(pady=(10, 15))

        # Resend
        ctk.CTkLabel(wrapper, text="Didn't receive the code?", font=ctk.CTkFont(size=12), text_color="gray").pack(pady=(5, 2))
        self.resend_button = ctk.CTkButton(
            wrapper,
            text="Resend OTP",
            command=self.async_resend_otp,
            fg_color="#444",
            hover_color="#636e72",
            text_color="white",
            width=140,
            height=35,
            corner_radius=8
        )
        self.resend_button.pack()

    def on_key_press(self, event):
        if event.keysym.isdigit() or event.keysym == "BackSpace":
            return
        return "break"

    def on_key_release(self, event, idx):
        key = event.keysym
        widget = event.widget
        value = widget.get()

        if key == "BackSpace":
            if not value and idx > 0:
                self.otp_boxes[idx - 1].focus()
            return

        if not key.isdigit():
            return

        if len(value) > 1 or (len(value) == 1 and widget.index("insert") == 1):
            widget.delete(0, "end")
            widget.insert(0, key)

        if idx < 5:
            self.otp_boxes[idx + 1].focus()

    def async_submit_otp(self):
        async_loop.run_coroutine(self.submit_otp())
    
    def async_resend_otp(self):
        async_loop.run_coroutine(self.resend_otp())

    async def submit_otp(self):
        self.submit_button.configure(state="disabled", text="Verifying OTP...")
        otp = "".join(box.get().strip() for box in self.otp_boxes)
        if len(otp) != 6 or not otp.isdigit():
            self.toast.show("Enter a valid 6-digit OTP.", type="error")
            self.submit_button.configure(state="normal", text="Verify OTP")
            return

        status, data = None, None
        try:
            status, data = await post_data(VERIFY_OTP_URL, {"email": self.email, "otp": otp, "deviceId": uuid})
        except Exception as e:
            self.toast.show("Error verifying OTP", type="error")
            self.submit_button.configure(state="normal", text="Verify OTP")
            return
        if status == 200:
            self.toast.show("OTP Verified!", type="success")
            storeage.add_data({"loggedIn": True})
            for box in self.otp_boxes:
                box.delete(0, "end")
            self.controller.show_page(LoadingPage)
            async_loop.run_coroutine(self.controller.show_home_page(self.controller))
        else:
            self.toast.show(data["message"], type="error")
        self.submit_button.configure(state="normal", text="Verify OTP")

    async def resend_otp(self):
        self.resend_button.configure(state="disabled", text="Resending OTP...")
        status, data = await post_data(RESEND_OTP_URL, {"email": self.email})
        if status == 200:
            self.toast.show(data["message"], type="success")
        else:
            self.toast.show(data["message"], type="error")
        self.resend_button.configure(state="normal", text="Resend OTP")

class PasswordPage(ctk.CTkFrame):
    email = None
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller
        self.toast = Toast(self)
        self.show_password = False

        # Wrapper to center
        wrapper = ctk.CTkFrame(self, fg_color="transparent")
        wrapper.place(relx=0.5, rely=0.5, anchor="center")

        # Header
        ctk.CTkLabel(wrapper, text="🔐 Enter Password", font=ctk.CTkFont(size=24, weight="bold")).pack(pady=(10, 6))
        self.email_label = ctk.CTkLabel(wrapper, text=f"Enter the password to continue", font=ctk.CTkFont(size=14), text_color="gray")
        self.email_label.pack(pady=(0, 25))

        # Entry Frame
        entry_frame = ctk.CTkFrame(wrapper, fg_color="transparent")
        entry_frame.pack()

        # Password Entry
        self.password_entry = ctk.CTkEntry(
            entry_frame,
            placeholder_text="Password",
            show="*",
            width=260,
            height=45,
            corner_radius=10
        )
        self.password_entry.pack(side="left", padx=(0, 5))

        # Load eye icons
        eye_open = Image.open("assets/eye_open.png").resize((20, 20))
        eye_closed = Image.open("assets/eye_closed.png").resize((20, 20))
        self.eye_open_icon = ctk.CTkImage(light_image=eye_open, dark_image=eye_open)
        self.eye_closed_icon = ctk.CTkImage(light_image=eye_closed, dark_image=eye_closed)

        # Eye Button
        self.eye_button = ctk.CTkButton(
            entry_frame,
            image=self.eye_closed_icon,
            text="",
            width=45,
            height=45,
            fg_color="transparent",
            hover_color="#2c2c2c",
            command=self.toggle_password
        )
        self.eye_button.pack(side="left")

        # Submit Button
        self.sign_in_button = ctk.CTkButton(
            wrapper,
            text="Sign In",
            command=self.async_handle_login,
            fg_color="#d63031",
            hover_color="#e17055",
            text_color="white",
            width=310,
            height=45,
            corner_radius=12
        )
        self.sign_in_button.pack(pady=(15, 10))

        # Forgot Password link
        forgot = ctk.CTkLabel(
            wrapper,
            text="Forgot Password?",
            font=ctk.CTkFont(size=12, underline=True),
            text_color="#7f8c8d",
            cursor="hand2"
        )
        forgot.pack()
        forgot.bind("<Button-1>", lambda e: webbrowser.open(FORGOT_PASSWORD_BASE))

    def toggle_password(self):
        self.show_password = not self.show_password
        self.password_entry.configure(show="" if self.show_password else "*")
        self.eye_button.configure(image=self.eye_open_icon if self.show_password else self.eye_closed_icon)

    def async_handle_login(self):
        async_loop.run_coroutine(self.handle_login())

    async def handle_login(self):
        self.sign_in_button.configure(state="disabled", text="Signing in...")
        password = self.password_entry.get().strip()
        if not password:
            self.toast.show("Please enter your password.", type="error")
            self.sign_in_button.configure(state="normal", text="Sign In")
            return
        status, data = None, None
        try:
            status, data = await post_data(VERIFY_PASSWORD_URL, {"email": self.email, "password": password, "deviceId": uuid})
        except Exception as e:
            self.toast.show("Error verifying password", type="error")
            self.sign_in_button.configure(state="normal", text="Sign In")
            return
        if status == 200:
            self.toast.show(data["message"], type="success")
            storeage.add_data({"loggedIn": True})
            self.password_entry.delete(0, "end")
            self.controller.show_page(LoadingPage)
            async_loop.run_coroutine(self.controller.show_home_page(self.controller))
        else:
            self.toast.show(data["message"], type="error")
        self.sign_in_button.configure(state="normal", text="Sign In")

class HomePage(ctk.CTkFrame):
    user_data = None
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller
        self.toast = Toast(self)

    def create_page(self):
        async_loop.run_coroutine(connect_socket(uuid))
        print("Connected to socket server")
        top_controls = ctk.CTkFrame(self, fg_color="transparent")
        top_controls.pack(fill="x", pady=10, padx=20)

        top_controls.grid_columnconfigure((0, 1), weight=1)

        # Interactive toggle theme (styled as a switch)
        self.theme_var = ctk.BooleanVar(value=ctk.get_appearance_mode() != "dark")
        is_dark = ctk.get_appearance_mode() == "Dark"

        self.theme_toggle = ctk.CTkSwitch(
            top_controls,
            text="Dark Mode",
            variable=self.theme_var,
            command=self.toggle_theme,
            switch_height=24,
            switch_width=48,
            fg_color="#444444" if is_dark else "#cccccc",
            progress_color="#03a9f4" if is_dark else "#3b82f6",  # teal in dark, blue in light
            button_color="#eeeeee",
            button_hover_color="#dddddd"
            
        )
        self.theme_toggle.grid(row=0, column=2, sticky="e", padx=5)

        logout_icon = ctk.CTkImage(Image.open("assets/logout.png"), size=(24, 24))
        self.logout_button = ctk.CTkButton(
            top_controls, text="", image=logout_icon,
            width=36, height=36, fg_color="transparent", hover_color="#333333",
            command=self.async_logout
        )
        self.logout_button.grid(row=0, column=3, sticky="e", padx=5)

        # --- Greeting Text ---
        greeting_frame = ctk.CTkFrame(self, fg_color="transparent")
        greeting_frame.pack(padx=20, anchor="w")

        ctk.CTkLabel(greeting_frame, text="👋 Welcome back!", font=ctk.CTkFont(size=24, weight="bold")).pack(anchor="w")
        ctk.CTkLabel(greeting_frame, text="Here's your dashboard — manage your settings and sessions.", font=ctk.CTkFont(size=14)).pack(anchor="w", pady=(0, 10))

        # --- Profile Card ---
        profile_frame = ctk.CTkFrame(self, corner_radius=10)
        profile_frame.pack(padx=20, pady=10, fill="x")

        profile_frame.grid_columnconfigure(0, weight=0)
        profile_frame.grid_columnconfigure(1, weight=1)
        profile_frame.grid_columnconfigure(2, weight=0)
        profile_frame.grid_columnconfigure(3, weight=0)

        # Rounded Profile Image
        profile_image_raw = Image.open(self.user_data['profileImage']).resize((60, 60))
        mask = Image.new("L", profile_image_raw.size, 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, 60, 60), fill=255)
        profile_image_raw.putalpha(mask)
        profile_image = ctk.CTkImage(profile_image_raw, size=(60, 60))

        ctk.CTkLabel(profile_frame, image=profile_image, text="").grid(row=0, column=0, padx=15, pady=15)

        name_email_frame = ctk.CTkFrame(profile_frame, fg_color="transparent")
        name_email_frame.grid(row=0, column=1, sticky="w")

        ctk.CTkLabel(name_email_frame, text=self.user_data['name'], font=ctk.CTkFont(size=18, weight="bold")).pack(anchor="w")
        ctk.CTkLabel(name_email_frame, text=self.user_data['email'], font=ctk.CTkFont(size=14)).pack(anchor="w")

        # Stop + Manage Buttons
        button_group = ctk.CTkFrame(profile_frame, fg_color="transparent")
        button_group.grid(row=0, column=2, padx=10)

        # self.enable_disable_button = ctk.CTkButton(button_group, text="Disable Control" if self.user_data['linked'] else "Enable Control"
        #                                            , fg_color="#e74c3c" if self.user_data['linked'] else "#00aa55",
        #                                             hover_color="#c0392b" if self.user_data['linked'] else "#008844",
        #                                             command=lambda: async_loop.run_coroutine(self.enable_disable_action()), font=ctk.CTkFont(size=12, weight="bold"))
        # self.enable_disable_button.pack(side="left", padx=(0, 5))

        self.manage_button = ctk.CTkButton(button_group, text="Manage Account", fg_color="#444", hover_color="#555", command=self.manage_action, font=ctk.CTkFont(size=12, weight="bold"))
        self.manage_button.pack(side="left")

        # --- Section Title (Select Items) ---
        ctk.CTkLabel(self, text="Ascess Permissions", font=ctk.CTkFont(size=16, weight="bold")).pack(anchor="w", padx=20, pady=(20, 0))

        # --- Scrollable Selection List ---
        scroll_frame = ctk.CTkScrollableFrame(self, height=180)
        scroll_frame.pack(padx=20, pady=(5, 5), fill="both", expand=True)

        self.selection_vars = []
        for permission in self.user_data['permissions']:  # Simulate many items
            var = ctk.StringVar(value="off") if permission['value'] == False else ctk.StringVar(value="on")
            chk = ctk.CTkCheckBox(scroll_frame, text=permission['name'], variable=var, onvalue="on",
                                   offvalue="off", fg_color="#03a9f4", hover_color="#29b6f6", checkbox_width=18, checkbox_height=18, border_width=1)
            chk.pack(anchor="w", padx=20, pady=2)
            self.selection_vars.append((permission['name'], var))

        # --- Save Button: Right aligned below scroll frame ---
        save_btn_container = ctk.CTkFrame(self, fg_color="transparent")
        save_btn_container.pack(fill="x", padx=20)

        self.save_button = ctk.CTkButton(save_btn_container, text="Save Changes", fg_color="#00aa55", hover_color="#008844", command=lambda: async_loop.run_coroutine(self.save_selection()), font=ctk.CTkFont(size=12, weight="bold"))
        self.save_button.pack(anchor="e", pady=10)

    def toggle_theme(self):
        new_theme = "dark" if self.theme_var.get() else "light"
        ctk.set_appearance_mode(new_theme)

    async def enable_disable_action(self):
        self.enable_disable_button.configure(state="disabled", text="Enabling..." if not self.user_data['linked'] else "Disabling...")
        status, data = await post_data(ENABLE_DISABLE_URL, {"deviceId": uuid, "linked": not self.user_data['linked']})
        if status == 200:
            print("started toast")
            self.toast.show(data["message"], type="success")
            print("ended toast")
            self.user_data['linked'] = not self.user_data["linked"]
        else:
            self.toast.show(data["message"], type="error")
        self.enable_disable_button.configure(state="normal", text="Enable Control" if not self.user_data['linked'] else "Disable Control"
                                             ,fg_color="#e74c3c" if self.user_data['linked'] else "#00aa55",
                                            hover_color="#c0392b" if self.user_data['linked'] else "#008844")

    def clear_page(self):
        for widget in self.winfo_children():
            widget.destroy()

    def manage_action(self):
        webbrowser.open(MANAGE_ACCOUNT_BASE)

    async def save_selection(self):
        self.save_button.configure(state="disabled", text="Saving...")
        selected = {self.user_data['desc_to_key'][item]: True if var.get() == "on" else False for item, var in self.selection_vars}
        status, data = await post_data(SAVE_PERMISSIONS_URL, {"deviceId": uuid, "permissions": selected})
        if status == 200:
            self.toast.show(data["message"], type="success")
        else:
            self.toast.show(data["message"], type="error")
        self.save_button.configure(state="normal", text="Save Changes")

    def async_logout(self):
        async_loop.run_coroutine(self.logout())

    async def logout(self):
        self.logout_button.configure(state="disabled")
        status, data = await post_data(LOGOUT_APP_URL, {"deviceId": uuid})
        if status == 200:
            self.toast.show(data["message"], type="success")
            storeage.add_data({"loggedIn": False})
            self.controller.show_page(LoginPage)
        else:
            self.toast.show(data["message"], type="error")
        self.logout_button.configure(state="normal")

def download_image_to_assets(url, path="assets"):
    filename = url.split("/")[-1]

    os.makedirs(path, exist_ok=True)

    filepath = os.path.join(path, filename)

    try:
        response = requests.get(url)
        response.raise_for_status()

        with open(filepath, "wb") as f:
            f.write(response.content)
        return filepath

    except Exception as e:
        print(f"Failed to download image: {e}")

async def show_home_page(app):
    try:
        status, data = await post_data(GET_USER_DATA_URL, {"deviceId": uuid})
        profile_image = download_image_to_assets(data["data"]["profileImage"])
        if not profile_image:
            profile_image = "assets/profile.webp"
        user_data = {
            "name": data["data"]["name"],
            "email": data["data"]["email"],
            "profileImage": profile_image,
            "permissions": [{"name": v, "value": k} for k, v in zip(data["data"]["permissions"].values(), data["data"]["permission_descriptions"].values())],
            "desc_to_key": {v: k for k, v in data["data"]["permission_descriptions"].items()},
        }
        if status == 200:
            HomePage.user_data = user_data
            app.pages[HomePage].clear_page()
            app.pages[HomePage].create_page()
            app.show_page(HomePage)
            return
        app.pages[LoadingPage].toast.show(data["message"], type="error")
    except Exception as e:
        app.pages[LoadingPage].toast.show("Error fetching user data", type="error")

if __name__ == "__main__":
    ctk.set_appearance_mode("dark")
    ctk.set_default_color_theme("blue")
    if stored_data and stored_data["loggedIn"]:
        async_loop.run_coroutine(connect_socket(uuid))
        print("Connected to socket server - 1")
    app = App(is_logged_in=stored_data["loggedIn"] if stored_data else False, show_home_page=show_home_page)
    app.mainloop()