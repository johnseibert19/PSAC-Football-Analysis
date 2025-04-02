#testing video prediction

from ultralytics import YOLO  # type: ignore

model = YOLO('yolov8n')

results = model.predict('Def-Pass_1_1.mp4', save=True)
print(results[0])
print('======================================')
for box in results[0].boxes:
    print(box)