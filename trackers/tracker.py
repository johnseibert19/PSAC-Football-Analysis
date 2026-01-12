from ultralytics import YOLO
import supervision as sv
import cv2
import pickle
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from utils import get_center_of_bbox, get_bbox_width

class Tracker:
    def __init__(self, model_path):
        self.model = YOLO(model_path)
        self.tracker = sv.ByteTrack()

    def detect_frames(self, frames):
        batch_size = 20
        detections= []

        #run detection in batchs to prevent memory problems
        for i in range(0,len(frames), batch_size):
            detections_batch = self.model.predict(frames[i: i+batch_size], conf = 0.3)
            detections += detections_batch

        return detections
    
    def get_object_tracks(self, frames, read_from_stub = False, stub_path = None):

        if read_from_stub and stub_path is not None and os.path.exists(stub_path):
            with open(stub_path,'rb') as f:
                tracks = pickle.load(f)
            return tracks

        detections = self.detect_frames(frames)

        tracks = {
            'db'      : [], #Defensive Back
            'lb'      : [], #Line Backer
            'skill'   : [], #Gerneral skill position
            'center'  : [], #center
            'qb'      : [], #Quarter Back
        }

        for frame_num, detection in enumerate(detections):
            cls_names = detection.names\
            
            if cls_names is None:
                print(f"[Warning] detection.names is None for frame {frame_num}")
                continue  # Skip this frame

            print(f"cls_names at frame {frame_num}: {cls_names}")

            cls_name_inv = {v:k for k,v in cls_names.items()}

            #convert to supervision detection format
            detection_supervision = sv.Detections.from_ultralytics(detection)

            #track objects
            detection_with_tracks = self.tracker.update_with_detections(detection_supervision)

            tracks["db"].append({})
            tracks["lb"].append({})
            tracks["skill"].append({})
            tracks["center"].append({})
            tracks["qb"].append({})


            for frame_detection in detection_with_tracks:
                bbox = frame_detection[0].tolist()
                cls_id = frame_detection[3]
                track_id = frame_detection[4]

                if cls_id == cls_name_inv['db']:
                    tracks['db'][frame_num][track_id]   = {"bbox":bbox}
                if cls_id == cls_name_inv['lb']:
                    tracks['lb'][frame_num][track_id]   = {"bbox":bbox}
                if cls_id == cls_name_inv['skill']:
                    tracks['skill'][frame_num][track_id] = {"bbox":bbox}
                if cls_id == cls_name_inv['center']:
                    tracks['center'][frame_num][track_id]    = {"bbox":bbox}
                if cls_id == cls_name_inv['qb']:
                    tracks['qb'][frame_num][track_id]    = {"bbox":bbox}

            for frame_detection in detection_supervision:
                bbox = frame_detection[0].tolist()
                cls_id = frame_detection[3]

            if stub_path is not None:
                with open(stub_path, 'wb') as f:
                    pickle.dump(tracks,f)

        return tracks #list of dictionaries
    
    def draw_ellipse(self, frame, bbox, color, track_id=None):
        y2 = int(bbox[3])

        x_center, _ = get_center_of_bbox(bbox) #only need x_center
        width = get_bbox_width(bbox)

        cv2.ellipse(
            frame,
            (x_center, y2),
            axes = (int(width), int(width*.35)),
            angle=0.0,
            startAngle=-45,
            endAngle=235,
            color= color, 
            thickness=2,
            lineType=cv2.LINE_4
        )

        #text box for idenity
        rectangle_width = 40
        rectangle_height = 20
        x1_rect = x_center - rectangle_width//2
        x2_rect = x_center + rectangle_width//2
        y1_rect = (y2 - rectangle_height//2) + 15
        y2_rect = (y2 + rectangle_height//2) + 15

        if track_id is not None:
            cv2.rectangle(frame,
                          (int(x1_rect),int(y1_rect)),
                          (int(x2_rect), int(y2_rect)),
                          color,
                          cv2.FILLED)

        x1_text = x1_rect+12
        #if track_id > 99:
        x1_text -=10

        cv2.putText(
            frame,
            f"{track_id}",
            (int(x1_text),int(y1_rect+15)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0,0,0),
            2
            )
            

        return frame
            
        
    def draw_annotations(self, video_frames, tracks):
        output_video_frames = []
        total_frames = min(
            len(video_frames),
            *(len(tracks[pos]) for pos in ["skill", "lb", "db", "center", "qb"])
        )

        for frame_num in range(total_frames):
            frame = video_frames[frame_num].copy()

            
            for position in ["skill", "lb", "db", "center", "qb"]:
                player_dict = tracks[position][frame_num]

                #draw all skill pos
                for track_id, player_data in player_dict.items():
                    color =  player_data.get("team_color",(255,0,0)) #player_data might be wrong
                    frame = self.draw_ellipse(frame, player_data["bbox"], color, track_id)

            output_video_frames.append(frame)

        return output_video_frames

    