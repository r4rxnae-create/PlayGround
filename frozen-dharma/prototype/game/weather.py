"""Dynamic weather + day/night; gameplay effects (honest, testable)."""
import random
WEATHERS = ["clear", "overcast", "rain", "storm", "snow", "fog", "sandstorm", "supernatural", "cosmic"]

class WeatherSystem:
    def __init__(self, region_id=1):
        self.region = region_id
        self.current = "snow" if region_id == 1 else "clear"
        self.t = 0.0
        self.time_of_day = 8.0  # 0..24
    def update(self, dt):
        self.t += dt
        self.time_of_day = (self.time_of_day + dt / 60.0) % 24
        if self.t > 45:
            self.t = 0
            pool = ["snow", "clear", "overcast", "fog", "supernatural"] if self.region == 1 else WEATHERS
            self.current = random.choice(pool)
    def visibility(self) -> float:
        return {"snow": 0.5, "fog": 0.4, "storm": 0.6, "sandstorm": 0.45}.get(self.current, 1.0)
    def lightning_hazard(self) -> bool:
        return self.current in ("storm", "supernatural")
    def is_night(self) -> bool:
        return self.time_of_day < 5.5 or self.time_of_day > 19.0
