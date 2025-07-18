import customtkinter as ctk
from componets.toast import Toast

class LoadingPage(ctk.CTkFrame):
    def __init__(self, parent, controller=None):
        super().__init__(parent, fg_color="#101012")
        self.controller = controller
        self.toast = Toast(self)
        self.dot_labels = []
        self.current_index = 0

        container = ctk.CTkFrame(self, fg_color="#101012")
        container.pack(expand=True)

        title = ctk.CTkLabel(container, text="Loading...", font=ctk.CTkFont(size=22, weight="bold"))
        title.pack(pady=20)

        dot_frame = ctk.CTkFrame(container, fg_color="transparent")
        dot_frame.pack()

        for i in range(3):
            lbl = ctk.CTkLabel(dot_frame, text="●", font=ctk.CTkFont(size=28), text_color="#555555")
            lbl.pack(side="left", padx=6)
            self.dot_labels.append(lbl)

        self.animate_dots()

    def animate_dots(self):
        for i, label in enumerate(self.dot_labels):
            label.configure(text_color="#6C28D9" if i == self.current_index else "#555555")

        self.current_index = (self.current_index + 1) % 3
        self.after(300, self.animate_dots)
