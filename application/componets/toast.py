import customtkinter as ctk
from PIL import Image
from utils import get_asset_path

class Toast:
    """A class to create and manage toast notifications in a Tkinter application."""
    def __init__(self, parent):
        self.parent = parent
        self._toast_widget = None

    def show(self, message: str, duration: int = 2500, type: str = "info"):
        if self._toast_widget and self._toast_widget.winfo_exists():
            self._toast_widget.destroy()

        fg_color = "#2b2b2b"

        icon_paths = {
            "success": get_asset_path("success.png"),
            "error": get_asset_path("error.png"), 
            "warning": get_asset_path("warning.png"),
            "info": get_asset_path("info.png")
        }

        icon_path = icon_paths.get(type, icon_paths["info"])
        image = Image.open(icon_path).resize((20, 20), Image.Resampling.LANCZOS)
        icon = ctk.CTkImage(light_image=image, dark_image=image, size=(20, 20))
        frame = ctk.CTkFrame(self.parent, fg_color=fg_color, corner_radius=12)
        self._toast_widget = frame
        icon_label = ctk.CTkLabel(frame, image=icon, text="")
        icon_label.pack(side="left", padx=(10, 6))

        msg_label = ctk.CTkLabel(
            frame,
            text=message,
            font=ctk.CTkFont(size=12, weight="bold"),
            text_color="white"
        )
        msg_label.pack(side="left", padx=6, pady=10)

        frame.place(relx=0.5, y=-50, anchor="n")
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
