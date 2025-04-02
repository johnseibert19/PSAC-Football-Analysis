from utils import read_video, save_video
from trackers import Tracker

def main():
        #Read video
        video_frames = read_video('input_videos/Def-Pass_1_1.mp4')

        #init tracker
        tracker = Tracker('best copy.pt')
        tracks = tracker.get_object_tracks(video_frames)

        #Save video
        save_video(video_frames, 'output_videos/output_video.avi')

if __name__ == '__main__':
        main()