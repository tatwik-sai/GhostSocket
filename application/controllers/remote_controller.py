from pynput.mouse import Controller, Button
import keyboard

mouse = Controller()

def handle_keyboard_event(event_data):
    """
    Simulates keyboard events based on the provided event data.

    Args:
        event_data (dict): A dictionary containing the key and event type.
    """
    key = event_data.get("key")
    event_type = event_data.get("event")

    if not key or event_type not in ("keydown", "keyup"):
        return

    if key == " ":
        key = "space"

    modifiers = {
        "shift": event_data.get("shiftKey", False),
        "ctrl": event_data.get("ctrlKey", False),
        "alt": event_data.get("altKey", False),
        "windows": event_data.get("metaKey", False)
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
        print(f"[-] Error handling key '{key}': {e}")


def _map_button(button_index):
    """
    A helper function that maps button index to pynput Button.

    Args:
        button_index (int): The index of the button (0 for left, 1 for middle, 2 for right).
    Returns:
        Button: The corresponding pynput Button.
    """
    return {
        0: Button.left,
        1: Button.middle,
        2: Button.right
    }.get(button_index, Button.left)

def handle_mouse_event(event):
    """
    Simulates mouse events based on the provided event data.

    Args:
        event (dict): A dictionary containing the mouse event data.
    """
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
        print(f"[-] Mouse event error: {e}")

