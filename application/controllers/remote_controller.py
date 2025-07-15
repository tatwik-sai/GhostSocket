import keyboard
from pynput.mouse import Controller, Button

mouse = Controller()

def handle_keyboard_event(event_data):

    key = event_data.get("key")
    event_type = event_data.get("event")

    if not key or event_type not in ("keydown", "keyup"):
        return

    # Normalize space key name
    if key == " ":
        key = "space"

    # Press or release modifier keys first
    modifiers = {
        "shift": event_data.get("shiftKey", False),
        "ctrl": event_data.get("ctrlKey", False),
        "alt": event_data.get("altKey", False),
        "windows": event_data.get("metaKey", False)  # Meta is usually the Windows key
    }

    try:
        if event_type == "keydown":
            # Press modifiers
            for mod, is_down in modifiers.items():
                if is_down:
                    keyboard.press(mod)
            keyboard.press(key)

        elif event_type == "keyup":
            keyboard.release(key)
            # Release modifiers
            for mod, is_down in modifiers.items():
                if is_down:
                    keyboard.release(mod)

    except Exception as e:
        print(f"Error handling key '{key}': {e}")


def _map_button(button_index):
    return {
        0: Button.left,
        1: Button.middle,
        2: Button.right
    }.get(button_index, Button.left)

def handle_mouse_event(event):
    event_type = event.get("event")

    try:
        if event_type == "move":
            x, y = event.get("x"), event.get("y")
            if x is not None and y is not None:
                mouse.position = (x, y)

        elif event_type == "down":
            btn = _map_button(event.get("button", 0))
            mouse.press(btn)

        elif event_type == "up":
            btn = _map_button(event.get("button", 0))
            mouse.release(btn)

        elif event_type == "wheel":
            dx = int(event.get("deltaX", 0))
            dy = int(event.get("deltaY", 0))
            mouse.scroll(dx, dy)

    except Exception as e:
        print(f"Mouse event error: {e}")

