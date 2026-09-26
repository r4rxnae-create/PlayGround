"""FROZEN DHARMA prototype — standalone native PC window (pygame/SDL).
Not a browser/voxel/mobile game. Run: python3 main.py [--smoke] [--level N]
"""
import sys, math, argparse
from game.game import Session
from game.config import GRAPHICS_PRESETS, BASE_RES
from game.resonance import Dharma
from game.world import region_for_level

def run_smoke(level=1):
    s = Session(level=level)
    logs = []
    for i in range(120):
        logs += s.step(1/60, {"mx": 1, "my": 0, "attack": i % 10 == 0,
                              "dharma": Dharma.AGNI if i == 30 else None,
                              "fusion": ("Vayu", "Agni") if i == 60 else None,
                              "boss_hit": i % 20 == 0})
    rid, rname = region_for_level(level)
    print(f"SMOKE OK level={level} region={rid}:{rname} pos={s.pos} kills={s.kills} "
          f"boss_hp={s.boss.hp:.0f} meter={s.resonance.meter:.0f} weather={s.weather.current}")
    return True

def run_window(level=1, preset="HIGH"):
    import pygame
    cfg = GRAPHICS_PRESETS[preset]
    W, H = int(BASE_RES[0]*cfg["res_scale"]), int(BASE_RES[1]*cfg["res_scale"])
    pygame.init()
    screen = pygame.display.set_mode((W, H))
    pygame.display.set_caption("FROZEN DHARMA: THE MYTHIC REAWAKENING — prototype slice")
    clock = pygame.time.Clock()
    font = pygame.font.SysFont("serif", 20)
    s = Session(level=level)
    rid, rname = region_for_level(level)
    running = True
    while running:
        dt = clock.tick(60)/1000
        act = {}
        for ev in pygame.event.get():
            if ev.type == pygame.QUIT:
                running = False
        keys = pygame.key.get_pressed()
        act["mx"] = (keys[pygame.K_d]-keys[pygame.K_a])
        act["my"] = (keys[pygame.K_s]-keys[pygame.K_w])
        act["sprint"] = keys[pygame.K_LSHIFT]
        act["attack"] = keys[pygame.K_j]
        act["heavy"] = keys[pygame.K_k]
        act["boss_hit"] = keys[pygame.K_b]
        if keys[pygame.K_1]: act["dharma"] = Dharma.AGNI
        s.step(min(dt, 0.05), act)
        # --- render (painterly placeholder for UE5 PBR pipeline; NOT final art) ---
        night = s.weather.is_night()
        sky = (8, 12, 28) if night else (18, 30, 52)
        screen.fill(sky)
        # snow particles scaled by preset fx
        import random
        for i in range(int(120*cfg["fx"])):
            x = (i*97 % W); y = (i*57 + pygame.time.get_ticks()//20) % H
            screen.fill((200, 220, 240), (x, y, 2, 2))
        # ground, player, enemies, boss bar
        pygame.draw.ellipse(screen, (40, 60, 80), (0, H*0.6, W, H*0.4))
        px, py = int(W/2), int(H*0.62)
        pygame.draw.circle(screen, (230, 180, 120), (px, py), 16)  # protagonist
        for i, e in enumerate(s.enemies):
            pygame.draw.circle(screen, (150, 60, 60), (px+60+i*50, py-20), 12)
        pygame.draw.rect(screen, (60, 60, 60), (20, 20, 300, 18))
        pygame.draw.rect(screen, (200, 60, 50), (20, 20, 300*s.player.hp/s.player.max_hp, 18))
        pygame.draw.rect(screen, (60, 60, 60), (20, 44, 300, 10))
        pygame.draw.rect(screen, (80, 200, 120), (20, 44, 300*s.player.stamina/s.player.max_stamina, 10))
        pygame.draw.rect(screen, (40, 40, 40), (20, H-40, W-40, 14))
        pygame.draw.rect(screen, (150, 40, 160), (20, H-40, (W-40)*(1-s.boss.hp/s.boss.max_hp*0+ s.boss.hp/s.boss.max_hp), 14))
        hud = font.render(f"Lvl {s.player.level} {rname} | {s.weather.current} | kills {s.kills} | meter {s.resonance.meter:.0f} | B=boss J/K attack 1=Agni", True, (230, 230, 230))
        screen.blit(hud, (20, 60))
        pygame.display.flip()
    pygame.quit()

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--smoke", action="store_true")
    ap.add_argument("--level", type=int, default=1)
    ap.add_argument("--preset", default="HIGH")
    a = ap.parse_args()
    if a.smoke:
        run_smoke(a.level)
    else:
        run_window(a.level, a.preset)
