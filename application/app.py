import re, os
import sys
import multiprocessing
import win32com.client
import win32event
import win32api
import winerror
import threading
import webbrowser
from config import *
import customtkinter as ctk
from storage import Storage
from PIL import Image, ImageDraw
from sender import connect_socket
from async_requests import post_data
from componets.toast import Toast
from PIL import Image, ImageDraw
from componets.loading import LoadingPage
from controllers.system_info import get_system_info
from utils import get_uuid, get_asset_path, download_image_to_assets, create_tray, AsyncLoopThread


multiprocessing.freeze_support()
uuid = get_uuid()
async_loop = AsyncLoopThread()
storeage = Storage("ghost_socket")
stored_data = storeage.get_data()


ctk.set_appearance_mode("dark")

class App(ctk.CTk):
    """Main application window for Ghost Socket."""
    def __init__(self, is_logged_in: bool = False, show_home_page=None):
        super().__init__()
        self.title("Ghost Socket")
        self.geometry("800x600")
        self.resizable(False, False)
        self.configure(fg_color="#101012")
        self.protocol("WM_DELETE_WINDOW", self.withdraw)
        self.show_home_page = show_home_page

        icon_path = get_asset_path("icon.ico")
        try:
            self.iconbitmap(icon_path)
        except Exception as e:
            print(f"[-] Could not load icon: {e}")

        self.container = ctk.CTkFrame(self, fg_color="#101012")
        self.container.pack(fill="both", expand=True)

        self.container.grid_rowconfigure(0, weight=1)
        self.container.grid_columnconfigure(0, weight=1)

        self.pages = {}

        for Page in (LoginPage, HomePage, OtpPage, PasswordPage, LoadingPage):
            page = Page(self.container, self)
            self.pages[Page] = page
            page.grid(row=0, column=0, sticky="nsew")

        if is_logged_in:
            self.show_page(LoadingPage)
            async_loop.run_coroutine(show_home_page(self))
        else:
            self.show_page(LoginPage)

    def show_page(self, page_class):
        page = self.pages[page_class]
        page.tkraise()

class LoginPage(ctk.CTkFrame):
    def __init__(self, parent, controller):
        super().__init__(parent, fg_color="#101012")
        self.toast = Toast(self)
        self.controller = controller

        wrapper = ctk.CTkFrame(self, fg_color="#101012")
        wrapper.place(relx=0.5, rely=0.5, anchor="center")

        ctk.CTkLabel(wrapper, text="🔐 Welcome Back", font=ctk.CTkFont(size=26, weight="bold")).pack(pady=(10, 6))
        ctk.CTkLabel(wrapper, text="Login to continue", font=ctk.CTkFont(size=14), text_color="gray").pack(pady=(0, 25))

        self.email_entry = ctk.CTkEntry(wrapper, placeholder_text="Email", width=300, height=40, corner_radius=10)
        self.email_entry.pack(pady=(10, 2))

        ctk.CTkLabel(
            wrapper,
            text="Enter the email linked to your GhostSocket account.",
            font=ctk.CTkFont(size=12),
            text_color="gray"
        ).pack(pady=(0, 15))

        self.login_button = ctk.CTkButton(
            wrapper,
            text="Login",
            command=self.async_handle_login,
            fg_color="#6C28D9",
            hover_color="#6411EB",
            text_color="white",
            width=300,
            height=40,
            corner_radius=10
        )
        self.login_button.pack(pady=12)

        ctk.CTkLabel(wrapper, text="──────── or ────────", text_color="gray").pack(pady=(10, 5))

        signup_button = ctk.CTkButton(
            wrapper,
            text="Sign Up",
            command=self.open_signup,
            fg_color="#6C28D9",
            hover_color="#6411EB",
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

        if not self.is_valid_email(email):
            self.toast.show("Please enter a valid email address.", type="error")
            self.login_button.configure(state="normal", text="Login")
            return

        status, data = None, None
        try:
            status, data = await post_data(CHECK_USER_URL, {"email": email})
        except Exception as e:
            self.toast.show("[-] Error checking user", type="error")
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
        super().__init__(parent, fg_color="#101012")
        self.controller = controller
        self.toast = Toast(self)

        wrapper = ctk.CTkFrame(self, fg_color="#101012")
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
            fg_color="#6C28D9",
            hover_color="#6411EB",
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
        super().__init__(parent, fg_color="#101012")
        self.controller = controller
        self.toast = Toast(self)
        self.show_password = False

        # Wrapper to center
        wrapper = ctk.CTkFrame(self, fg_color="#101012")
        wrapper.place(relx=0.5, rely=0.5, anchor="center")

        # Header
        ctk.CTkLabel(wrapper, text="🔐 Enter Password", font=ctk.CTkFont(size=24, weight="bold")).pack(pady=(10, 6))
        self.email_label = ctk.CTkLabel(wrapper, text=f"Enter the password to continue", font=ctk.CTkFont(size=14), text_color="gray")
        self.email_label.pack(pady=(0, 25))

        # Entry Frame
        entry_frame = ctk.CTkFrame(wrapper, fg_color="#101012")
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
        eye_open_path = get_asset_path("eye_open.png")
        eye_closed_path = get_asset_path("eye_closed.png")
        eye_open = Image.open(eye_open_path).resize((20, 20))
        eye_closed = Image.open(eye_closed_path).resize((20, 20))
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
            fg_color="#6C28D9",
            hover_color="#6411EB",
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
        self.check_boxes = []
        self.main_checkbox = None

    def create_page(self):
        async_loop.run_coroutine(connect_socket(uuid))
        print("[+] Connected to socket server")
        top_controls = ctk.CTkFrame(self, fg_color="transparent")
        top_controls.pack(fill="x", pady=10, padx=20)

        top_controls.grid_columnconfigure((0, 1), weight=1)

        self.theme_var = ctk.BooleanVar(value=ctk.get_appearance_mode() != "dark")
        is_dark = ctk.get_appearance_mode() == "Dark"
        self.configure(fg_color="#101012" if is_dark else "#ffffff")

        self.theme_toggle = ctk.CTkSwitch(
            top_controls,
            text="Dark Mode",
            variable=self.theme_var,
            command=self.toggle_theme,
            switch_height=24,
            switch_width=48,
            fg_color="#101012" if is_dark else "#cccccc",
            progress_color="#6C28D9" if is_dark else "#6C28D9",
            button_color="#eeeeee",
            button_hover_color="#dddddd"
            
        )
        self.theme_toggle.grid(row=0, column=2, sticky="e", padx=5)

        logout_icon = ctk.CTkImage(Image.open(get_asset_path("logout.png")), size=(24, 24))
        self.logout_button = ctk.CTkButton(
            top_controls, text="", image=logout_icon,
            width=36, height=36, fg_color="transparent", hover_color="#333333" if is_dark else "#C3B3DD",
            command=self.async_logout
        )
        self.logout_button.grid(row=0, column=3, sticky="e", padx=5)

        # Greeting Text
        greeting_frame = ctk.CTkFrame(self, fg_color="transparent")
        greeting_frame.pack(padx=20, anchor="w")

        ctk.CTkLabel(greeting_frame, text="👋 Welcome back!", font=ctk.CTkFont(size=24, weight="bold")).pack(anchor="w")
        ctk.CTkLabel(greeting_frame, text="Here's your dashboard — manage your settings and sessions.", font=ctk.CTkFont(size=14)).pack(anchor="w", pady=(0, 10))

        # Profile Card
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

        self.manage_button = ctk.CTkButton(button_group, text="Manage Account", fg_color="#444", hover_color="#555", command=self.manage_action, font=ctk.CTkFont(size=12, weight="bold"))
        self.manage_button.pack(side="left")

        # Section Title
        ctk.CTkLabel(self, text="Ascess Permissions", font=ctk.CTkFont(size=16, weight="bold")).pack(anchor="w", padx=20, pady=(20, 0))

        # Scrollable List
        scroll_frame = ctk.CTkScrollableFrame(self, height=180)
        scroll_frame.pack(padx=20, pady=(5, 5), fill="both", expand=True)

        self.selection_vars = []
        for permission in self.user_data['permissions']:
            var = ctk.StringVar(value="off") if permission['value']['allowed'] == False else ctk.StringVar(value="on")
            chk = ctk.CTkCheckBox(scroll_frame, text=permission['value']["shortDescription"], variable=var, onvalue="on", font=ctk.CTkFont(size=12, weight="bold"),
                                   offvalue="off", fg_color="#6C28D9", hover_color="#6411EB", checkbox_width=18, checkbox_height=18, border_width=1)
            chk.pack(anchor="w", padx=10, pady=0)
            custom_label = ctk.CTkLabel(scroll_frame, text=permission["value"]["longDescription"], font=ctk.CTkFont(size=12, weight="normal"), text_color="#666565")
            custom_label.pack(anchor="w", padx=35, pady=(0, 10))
            self.selection_vars.append((permission['name'], var))
            self.check_boxes.append(chk)
            if permission['name'] == "remoteControl":
                self.main_checkbox = chk
                self.main_checkbox.configure(command=self.handle_checkbox_all)
            else:
                chk.configure(command=self.handle_checkbox)

        save_btn_container = ctk.CTkFrame(self, fg_color="transparent")
        save_btn_container.pack(fill="x", padx=20)

        self.save_button = ctk.CTkButton(save_btn_container, text="Save Changes", fg_color="#6C28D9", hover_color="#6411EB", command=lambda: async_loop.run_coroutine(self.save_selection()), font=ctk.CTkFont(size=12, weight="bold"))
        self.save_button.pack(anchor="e", pady=10)

    def handle_checkbox_all(self):
        value = self.main_checkbox.get()
        for cb in self.check_boxes:
            cb.select() if value == "on" else cb.deselect()
    
    def handle_checkbox(self):
        if self.main_checkbox.get() == "on":
            for cb in self.check_boxes:
                if cb.get() == "off":
                    self.main_checkbox.deselect()

    def toggle_theme(self):
        new_theme = "dark" if self.theme_var.get() else "light"
        if new_theme == 'light':
            self.configure(fg_color="#ffffff")
            self.logout_button.configure(hover_color="#C3B3DD")
        else:
            self.configure(fg_color="#101012")
            self.logout_button.configure(hover_color="#333333")
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
        selected = {item: True if var.get() == "on" else False for item, var in self.selection_vars}
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

async def show_home_page(app):
    try:
        print("[+] Posting device info to server")
        device_info = get_system_info()
        status, data = await post_data(UPDATE_DEVICE_INFO_URL, {"deviceInfo": device_info, "deviceId": uuid})
        print("[+] Fetching user data")
        status, data = await post_data(GET_USER_DATA_URL, {"deviceId": uuid})
        if status == 404 and data.get("type") == "deleted":
            print("[-] Device not found or deleted, redirecting to login page")
            app.pages[LoadingPage].toast.show("Device not found or deleted", type="error")
            storeage.add_data({"loggedIn": False})
            app.show_page(LoginPage)
            return

        if status != 200:
            print(f"[-] API Error: {data}")
            app.pages[LoadingPage].toast.show(data.get("message", "Failed to fetch user data"), type="error")
            return

        print("[+] Downloading profile image")
        profile_image = download_image_to_assets(data["data"]["profileImage"])
        if not profile_image:
            profile_image = get_asset_path("profile.webp")

        print("[+] Building user data")
        user_data = {
            "name": data["data"]["name"],
            "email": data["data"]["email"],
            "profileImage": profile_image,
            "permissions": [{ "name": str(key), "value": value } for key, value in data["data"]["permissions"].items()],
        }
        
        HomePage.user_data = user_data
        app.pages[HomePage].clear_page()
        app.pages[HomePage].create_page()
        app.show_page(HomePage)
        print("[+] Home page loaded successfully")
        
    except Exception as e:
        print(f"[-] Error in show_home_page: {e}")
        import traceback
        traceback.print_exc()
        try:
            app.pages[LoadingPage].toast.show("[-] Error loading home page", type="error")
        except:
            print("[-] Could not show toast")
        
def add_to_startup():   
    startup_dir = os.path.join(os.environ["APPDATA"], r"Microsoft\\Windows\\Start Menu\\Programs\\Startup")
    exe_path = sys.executable if getattr(sys, 'frozen', False) else sys.argv[0]
    shortcut_path = os.path.join(startup_dir, "GhostSocket.lnk")

    if not os.path.exists(shortcut_path):
        try:
            shell = win32com.client.Dispatch("WScript.Shell")
            shortcut = shell.CreateShortCut(shortcut_path)
            shortcut.Targetpath = exe_path
            shortcut.WorkingDirectory = os.path.dirname(exe_path)
            shortcut.IconLocation = exe_path
            shortcut.save()
            print("[+] Added to startup.")
        except Exception as e:
            print(f"[-] Failed to add to startup: {e}")


if __name__ == "__main__":
    mutex = win32event.CreateMutex(None, False, "Global\\GhostSocketAppMutex")
    last_error = win32api.GetLastError()

    if last_error == winerror.ERROR_ALREADY_EXISTS:
        print("[-] Another instance is already running.")
        sys.exit()
    try:
        add_to_startup()
        if stored_data and stored_data["loggedIn"]:
            async_loop.run_coroutine(connect_socket(uuid))
            print("[+] Connected to socket server")
        app = App(is_logged_in=stored_data["loggedIn"] if stored_data else False, show_home_page=show_home_page)
        tray_thread = threading.Thread(target=create_tray, args=(app,), daemon=True)
        tray_thread.start()
        if "--tray" not in sys.argv:
            app.mainloop()
        else:
            app.withdraw()
            app.mainloop()
    except Exception as e:
        import traceback
        with open("error.log", "w") as f:
            traceback.print_exc(file=f)
        raise