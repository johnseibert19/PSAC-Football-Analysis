# file: team_assigner.py
import os
import cv2
import numpy as np
from sklearn.cluster import KMeans
import colorsys
from collections import defaultdict, deque
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA


class TeamAssigner:
    def __init__(self):
        self.team_colors = {}
        self.player_team_dict = {}
        self.kmeans = None
        self.sorted_idx = None
        self.team_history = defaultdict(lambda: deque(maxlen=3))
        os.makedirs("debug_null_colors", exist_ok=True)

    def plot_color_clusters(self, player_colors, kmeans):
        # Convert player_colors to np.array if it's not already
        player_colors = np.array(player_colors)
        
        # Reduce dimensions to 2D for visualization
        pca = PCA(n_components=2)
        reduced = pca.fit_transform(player_colors)

        labels = kmeans.labels_
        centers = pca.transform(kmeans.cluster_centers_)

        plt.figure(figsize=(8, 6))
        scatter = plt.scatter(reduced[:, 0], reduced[:, 1], c=labels, cmap='viridis', edgecolor='k', s=80)
        
        plt.scatter(centers[:, 0], centers[:, 1], c='red', s=200, marker='X', label='Centers')
        plt.title("KMeans Clustering of Player Colors")
        plt.xlabel("Main Color Difference (based on RGB)")
        plt.ylabel("Secondary Color Difference (based on RGB)")
        plt.legend()
        plt.grid(True)
        plt.tight_layout()
        plt.savefig("debug_null_colors/color_clusters.png")
        plt.close()

    def apply_clahe(self, image):
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        merged = cv2.merge((cl, a, b))
        return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)

    def get_clustering_model(self, image):
        image_2d = image.reshape(-1, 3)
        kmeans = KMeans(n_clusters=2, init="k-means++", n_init=10)
        kmeans.fit(image_2d)
        return kmeans

    def get_player_color(self, frame, bbox, player_id=None):
        x1, y1, x2, y2 = map(int, bbox)
        raw_image = frame[y1:y2, x1:x2]
        if raw_image.size == 0:
            return None

        h, w, _ = raw_image.shape
        if w < 5 or h < 5:
            return None  # too small to extract meaningful color

        # Extract center vertical slice (20% of width)
        slice_width = max(1, w // 5)
        center_x = w // 2
        x_start = max(0, center_x - slice_width // 2)
        x_end = min(w, center_x + slice_width // 2)

        center_strip_raw = raw_image[:, x_start:x_end]
        center_strip_clahe = self.apply_clahe(center_strip_raw)

        # KMeans clustering
        kmeans = self.get_clustering_model(center_strip_clahe)
        labels = kmeans.labels_.reshape(center_strip_clahe.shape[:2])

        # Find dominant cluster
        unique, counts = np.unique(labels, return_counts=True)
        dominant_cluster = unique[np.argmax(counts)]

        mask = labels == dominant_cluster
        player_pixels = center_strip_raw[mask]

        player_color = np.mean(player_pixels, axis=0)

        if player_color.shape != (3,) or not np.issubdtype(player_color.dtype, np.floating):
            print(f"\t\t[Error] Invalid color shape/dtype for player {player_id}")

        return player_color



    def save_kmeans_debug_image(self, image, labels, player_id):
        h, w = labels.shape
        vis_image = np.zeros((h, w, 3), dtype=np.uint8)
        unique_labels = np.unique(labels)
        colors = [tuple(np.random.randint(0, 255, 3).tolist()) for _ in unique_labels]

        for i, lbl in enumerate(unique_labels):
            vis_image[labels == lbl] = colors[i]

        filename = f"debug_null_colors/player_{player_id}_clusters.png"
        cv2.imwrite(filename, vis_image)

    def assign_team_color(self, frame, player_detections):
        player_colors = []
        for player_id, det in player_detections.items():
            bbox = det["bbox"]
            color = self.get_player_color(frame, bbox, player_id)
            if (
                color is None
                or not isinstance(color, np.ndarray)
                or color.shape != (3,)
                or np.isnan(color).any()
            ):
                print(f"[Warn] Skipping player {player_id}, invalid color: {color}")
                continue
            print(f"[Clustering] Accepting player {player_id} with color: {color}")
            player_colors.append(color)


        if len(player_colors) < 2:
            print("[Warning] Not enough valid players for clustering.")
            return

        kmeans = KMeans(n_clusters=2, init="k-means++", n_init=1)
        kmeans.fit(player_colors)
        self.plot_color_clusters(player_colors, kmeans)


        def rgb_to_hue(color):
            r, g, b = color / 255.0
            return colorsys.rgb_to_hsv(r, g, b)[0]

        centers = kmeans.cluster_centers_
        hues = [rgb_to_hue(c) for c in centers]
        sorted_idx = np.argsort(hues)

        self.team_colors[1] = centers[sorted_idx[0]]
        self.team_colors[2] = centers[sorted_idx[1]]
        self.kmeans = kmeans
        self.sorted_idx = sorted_idx
        print(f"[Assign] Clustered {len(player_colors)} player colors.")


    def get_player_team(self, frame, player_bbox, player_id):
        #print(f"[Call] get_player_team called for Player {player_id}")

        color = self.get_player_color(frame, player_bbox, player_id)

        if color is None or np.isnan(color).any() or np.all(color < 10):
            print(f"[Warning] Bad color for player {player_id}: {color}")
            return self.majority_vote(player_id)

        if self.kmeans is None:
            print("[Warning] KMeans not initialized.")
            return 0

        cluster_id = self.kmeans.predict(color.reshape(1, -1))[0]
        team_id = np.where(self.sorted_idx == cluster_id)[0][0] + 1

        self.team_history[player_id].append(team_id)
        self.player_team_dict[player_id] = team_id
        return self.majority_vote(player_id)

    def majority_vote(self, player_id):
        votes = list(self.team_history[player_id])
        if not votes:
            return 0
        return max(set(votes), key=votes.count)