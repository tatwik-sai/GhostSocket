import customtkinter as ctk
import webbrowser
import re
from tkinter import simpledialog
from storage import Storage
import asyncio
import aiohttp
import threading
from PIL import Image
from config import *

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


class Toast:
    def __init__(self, parent):
        self.parent = parent
        self._toast_widget = None

    def show(self, message: str, duration: int = 2500, type: str = "error"):
        if self._toast_widget and self._toast_widget.winfo_exists():
            self._toast_widget.destroy()

        # Color mapping
        colors = {
            "error": "#e74c3c",   # red
            "success": "#2ecc71", # green
            "warning": "#f39c12", # orange
            "info":   "#2c3e50" #dark gray
        }

        fg_color = colors.get(type, "#2c3e50")  # default gray

        # Create toast widget
        toast = ctk.CTkLabel(
            self.parent,
            text=message,
            font=ctk.CTkFont(size=14),
            text_color="white",
            fg_color=fg_color,
            corner_radius=12,
            width=300,
            height=40
        )
        self._toast_widget = toast
        toast.place(relx=0.5, y=-50, anchor="n")  # off-screen top

        self._slide_in(toast, target_y=30)
        toast.after(duration, lambda: self._slide_out(toast))

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
    def __init__(self, is_logged_in: bool = False):
        super().__init__()
        self.title("Ghost Socket")
        self.geometry("800x600")
        self.resizable(False, False)

        # Container to hold all pages
        self.container = ctk.CTkFrame(self)
        self.container.pack(fill="both", expand=True)

        # ✨ Fix: allow pages to expand inside container
        self.container.grid_rowconfigure(0, weight=1)
        self.container.grid_columnconfigure(0, weight=1)

        # Dictionary to store pages
        self.pages = {}

        for Page in (LoginPage, HomePage, OtpPage, PasswordPage):
            page = Page(self.container, self)
            self.pages[Page] = page
            page.grid(row=0, column=0, sticky="nsew")  # fills container

        if is_logged_in:
            self.show_page(HomePage)
        else:
            self.show_page(LoginPage)

    def show_page(self, page_class):
        page = self.pages[page_class]
        page.tkraise()

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

        # Replace with your actual login logic
        status, data = await post_data(CHECK_USER_URL, {"email": email})
        if status == 200:
            if data["type"] == "otp":
                OtpPage.email = email
                self.controller.show_page(OtpPage)
            elif data["type"] == "email_password":
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

        print("OTP Entered:", otp)
        status, data = await post_data(VERIFY_OTP_URL, {"email": self.email, "otp": otp})
        if status == 200:
            self.toast.show("OTP Verified!", type="success")
            storeage.add_data({"deviceId": data["deviceId"]})
            self.controller.show_page(HomePage)
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
        status, data = await post_data(VERIFY_PASSWORD_URL, {"email": self.email, "password": password})
        if status == 200:
            self.toast.show(data["message"], type="success")
            storeage.add_data({"deviceId": data["deviceId"]})
            self.controller.show_page(HomePage)
        else:
            self.toast.show(data["message"], type="error")
        self.sign_in_button.configure(state="normal", text="Sign In")

class HomePage(ctk.CTkFrame):
    def __init__(self, parent, controller):
        super().__init__(parent)

        ctk.CTkLabel(self, text="Home Page", font=ctk.CTkFont(size=20)).pack(pady=20)

        ctk.CTkButton(self, text="Logout", command=lambda: controller.show_page(LoginPage)).pack(pady=10)

if __name__ == "__main__":
    ctk.set_appearance_mode("dark")
    ctk.set_default_color_theme("blue")
    app = App()
    app.mainloop()
