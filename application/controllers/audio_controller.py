import numpy as np
import sounddevice as sd
import av
from aiortc import AudioStreamTrack
import fractions


print(sd.query_devices())
print(sd.query_hostapis())
print(sd.default.hostapi)

class TestAudioTrack(AudioStreamTrack):
    def __init__(self):
        super().__init__()
        self.counter = 0
        self.sample_rate = 44100
        self.samples_per_frame = 1024
        print("Test audio track initialized")

    async def recv(self):
        self.counter += 1
        print(f"Test audio frame #{self.counter}")
        
        pts, time_base = await self.next_timestamp()
        
        import math
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

# class MicrophoneStreamTrack(MediaStreamTrack):
#     kind = "audio"

#     def __init__(self):
#         super().__init__()  # initialize MediaStreamTrack
#         self.p = pyaudio.PyAudio()
#         self.stream = self.p.open(format=pyaudio.paInt16,
#                                   channels=1,
#                                   rate=44100,
#                                   input=True,
#                                   frames_per_buffer=1024)
#         self.sample_rate = 44100

#     async def recv(self):
#         audio_data = self.stream.read(1024, exception_on_overflow=False)
#         frame = av.AudioFrame.from_ndarray(
#             np.frombuffer(audio_data, dtype=np.int16),
#             format='s16',
#             layout='mono'
#         )
#         frame.sample_rate = self.sample_rate
#         print("Sending audio frame")
#         return frame

# class SystemAudioStreamTrack(AudioStreamTrack):
#     def __init__(self, samplerate=48000, channels=2):
#         super().__init__()
#         self.samplerate = samplerate
#         self.channels = channels
#         self.device = 17  # Index for 'Stereo Mix'
#         self.stream = sd.InputStream(
#             device=self.device,
#             samplerate=self.samplerate,
#             channels=self.channels,
#             dtype='int16'
#         )
#         self.stream.start()
#         self.samples_per_frame = int(self.samplerate * 0.02)  # 20ms
#         self.pts = 0
#         self.time_base = fractions.Fraction(1, self.samplerate)

#     async def recv(self):
#         print("Sending audio frame")
#         audio, _ = self.stream.read(self.samples_per_frame)
#         frame = AudioFrame(format="s16", layout="stereo", samples=self.samples_per_frame)
#         for i in range(self.channels):
#             frame.planes[i].update(audio[:, i].tobytes())

#         frame.pts = self.pts
#         frame.sample_rate = self.samplerate
#         frame.time_base = self.time_base
#         self.pts += self.samples_per_frame
#         return frame
