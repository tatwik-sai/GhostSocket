import numpy as np
import sounddevice as sd
import av
from aiortc import AudioStreamTrack
import math

class AudioTrack(AudioStreamTrack):
    """Base class for audio tracks in the application."""
    def __init__(self):
        super().__init__()
        self.counter = 0
        self.sample_rate = 44100
        self.samples_per_frame = 1024
        print("[+]Audio track initialized")

    async def recv(self):
        """Returns the next audio frame."""
        self.counter += 1
        
        pts, time_base = await self.next_timestamp()
        
        samples = self.samples_per_frame
        frequency = 440 
        
        audio_data = []
        for i in range(samples):
            phase = (self.counter * samples + i) / self.sample_rate
            value = int(16383 * math.sin(2 * math.pi * frequency * phase))
            audio_data.append(value)
        
        audio_array = np.array(audio_data, dtype=np.int16).reshape(1, -1)
        
        frame = av.AudioFrame.from_ndarray(
            audio_array,
            format='s16',
            layout='mono'
        )
        frame.sample_rate = self.sample_rate
        frame.pts = pts
        frame.time_base = time_base
        
        return frame