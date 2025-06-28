import cv2
import numpy as np
from mss import mss

# Initialize mss
with mss() as sct:
    # Grab the primary monitor (index 1)
    monitor = sct.monitors[1]
    
    # Capture the screen
    screenshot = sct.grab(monitor)

    # Convert the raw image to a NumPy array (drop alpha channel)
    img = np.array(screenshot)[:, :, :3]

    # Convert BGR to RGB for OpenCV display
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # Show the image
    cv2.imshow("Screen Shot", img)
    cv2.waitKey(0)  # Wait for key press
    cv2.destroyAllWindows()
