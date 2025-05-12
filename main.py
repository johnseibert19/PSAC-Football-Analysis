from utils import read_video, save_video
from trackers import Tracker
from team_assigner import TeamAssigner
import cv2
from collections import defaultdict, deque

def main():
    # Read video
    video_frames = read_video('input_videos\Off-Run_1_1.mp4')

    # Init tracker
    tracker = Tracker('Skill_pos AI.pt')

    tracks = tracker.get_object_tracks(
        video_frames,
        read_from_stub=False,
        stub_path='stubs/track_stubs.pkl'
    )

    print("Number of video frames:", len(video_frames))
    if len(video_frames) == 0:
        print("Error: No video frames found!")
        return

    # Assign Player Teams
    team_assigner = TeamAssigner()
    team_log = {}
    locked_players = set()
    vote_history = defaultdict(lambda: deque(maxlen=5))

    # Do team clustering once at frame 0
    combined_tracks = {}
    for position in ['skill', 'db', 'lb', 'center', 'qb']:
        combined_tracks.update(tracks[position][0])
    team_assigner.assign_team_color(video_frames[0], combined_tracks)

    for frame_num in range(len(video_frames)):
        # Assign team/team_color to each player
        for position in ['skill', 'db', 'lb', 'center', 'qb']:
            player_track = tracks[position][frame_num]
            for player_id, track in player_track.items():
                if player_id in locked_players:
                    team = team_log[player_id]
                else:
                    team = team_assigner.get_player_team(video_frames[frame_num], track['bbox'], player_id)
                    vote_history[player_id].append(team)
                    majority_team = max(set(vote_history[player_id]), key=vote_history[player_id].count)
                    if vote_history[player_id].count(majority_team) >= 3:
                        locked_players.add(player_id)
                        team_log[player_id] = majority_team
                        print(f"[Lock] Player {player_id} locked to Team {majority_team} at frame {frame_num}")
                    else:
                        team_log[player_id] = team

                track['team'] = team_log[player_id]
                track['team_color'] = team_assigner.team_colors.get(team_log[player_id], (128, 128, 128))  # fallback color

    # Draw object Tracks
    output_video_frames = tracker.draw_annotations(video_frames, tracks)

    # Save video
    save_video(output_video_frames, 'output_videos/output_video_CLAHE.mp4')

if __name__ == '__main__':
    main()
