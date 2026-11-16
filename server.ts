import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const PRIMARY_MODEL = 'gemini-3.5-flash-lite';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface RoastRequestBody {
  playerName?: string;
  className?: string;
  hp?: number;
  maxHp?: number;
  shield?: number;
  weaponName?: string;
  weaponLevel?: number;
  atk?: number;
  armorName?: string;
  armorLevel?: number;
  def?: number;
  bossHp?: number;
  bossMaxHp?: number;
  turnNumber?: number;
  potionsUsed?: number;
  event?: string;
  damageDealt?: number;
}

interface WeaponRequestBody {
  playerName?: string;
  className?: string;
  weaponName?: string;
  armorName?: string;
  turnsTaken?: number;
  potionsUsed?: number;
  hpRemaining?: number;
  maxHp?: number;
  score?: number;
  gold?: number;
}

function buildFallbackRoast(body: RoastRequestBody): string {
  const hp = body.hp ?? 20;
  const maxHp = Math.max(1, body.maxHp ?? 30);
  const hpRatio = hp / maxHp;
  const potions = body.potionsUsed ?? 0;
  const turns = body.turnNumber ?? 1;
  const weapon = body.weaponName || 'that scrap blade';
  const weaponLvl = body.weaponLevel ?? 1;

  if (body.event === 'player_potion' || potions >= 2) {
    return `Sipping vial #${Math.max(1, potions)} already? You're leaking oil faster than you can patch it.`;
  }
  if (hpRatio <= 0.35) {
    return `Down to ${hp} HP and still swinging ${weapon}? This sanctum will be your tomb.`;
  }
  if (body.event === 'player_crit') {
    return `A lucky spark through my plating—let's see if ${weapon} holds together for the next exchange.`;
  }
  if (weaponLvl <= 1) {
    return `Is ${weapon} really the best gear you could scavenge? Even the Scrap Rats laugh at that edge.`;
  }
  if (turns >= 5) {
    return `${turns} turns wasted and I'm still standing. Your stamina is fading, ${body.playerName || 'runner'}.`;
  }
  return `Is that the best gear you could find? Come closer and let my core test your ${body.armorName || 'plating'}.`;
}

function buildFallbackWeapon(body: WeaponRequestBody) {
  const hero = body.playerName || 'Runner';
  const turns = body.turnsTaken ?? 4;
  return {
    name: turns <= 5 ? "Overlord's Execution Edge" : 'Zenexis Null-Breaker',
    description: `Forged from the shattered sanctum core claimed by ${hero} after surviving ${turns} brutal turns against the Overlord.`,
    bonusAtk: 5,
    loreTag: 'Boss Relic · Floor 3',
    source: 'fallback' as const,
  };
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Gemini request timed out')), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function generateWithModelFallback(
  params: Parameters<typeof ai.models.generateContent>[0]
) {
  try {
    return await withTimeout(ai.models.generateContent(params), 4000);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isNotFound = msg.includes('404') || msg.includes('NOT_FOUND') || msg.includes('not found');
    if (isNotFound && params.model === PRIMARY_MODEL) {
      return await withTimeout(
        ai.models.generateContent({
          ...params,
          model: FALLBACK_MODEL,
        }),
        4000
      );
    }
    throw err;
  }
}

async function createApp() {
  const app = express();
  app.use(express.json());

  app.post('/api/boss/roast', async (req, res) => {
    const body = (req.body ?? {}) as RoastRequestBody;
    const fallback = buildFallbackRoast(body);

    if (!process.env.GEMINI_API_KEY) {
      res.json({ line: fallback, source: 'fallback' });
      return;
    }

    const hp = body.hp ?? 0;
    const maxHp = Math.max(1, body.maxHp ?? 1);
    const hpPct = Math.round((hp / maxHp) * 100);

    const prompt = [
      `Combat Event: ${body.event || 'encounter_start'}${body.damageDealt ? ` (Hero dealt ${body.damageDealt} dmg)` : ''}`,
      `Hero: ${body.playerName || 'Runner'} (${body.className || 'Operative'})`,
      `Hero HP: ${hp}/${maxHp} (${hpPct}%), Kinetic Shield: ${body.shield ?? 0}`,
      `Hero Gear: Weapon="${body.weaponName || 'Starter Blade'}" (+${body.weaponLevel ?? 1}, ATK ${body.atk ?? 7}), Armor="${body.armorName || 'Starter Vest'}" (+${body.armorLevel ?? 1}, DEF ${body.def ?? 3})`,
      `Potions Used: ${body.potionsUsed ?? 0}, Combat Turn: ${body.turnNumber ?? 1}`,
      `Boss HP: ${body.bossHp ?? 80}/${body.bossMaxHp ?? 80}`,
      `Deliver a sharp, contextual 1-2 sentence roast reacting specifically to these live stats.`,
    ].join('\n');

    try {
      const response = await generateWithModelFallback({
        model: PRIMARY_MODEL,
        contents: prompt,
        config: {
          systemInstruction:
            'You are Zenexis Overlord, a sarcastic, ruthless cyberpunk dungeon boss. Write punchy 1-2 sentence trash-talk roasts mocking the player based on their live HP ratio, cheap or underleveled weapon/shield gear, potions used, or turns wasted. Output plain dialogue text only with no surrounding quotation marks or markdown.',
        },
      });

      const line = (response.text ?? '').trim().replace(/^["']|["']$/g, '');
      if (!line) {
        res.json({ line: fallback, source: 'fallback' });
        return;
      }
      res.json({ line, source: 'gemini' });
    } catch {
      res.json({ line: fallback, source: 'fallback' });
    }
  });

  app.post('/api/boss/weapon', async (req, res) => {
    const body = (req.body ?? {}) as WeaponRequestBody;
    const fallback = buildFallbackWeapon(body);

    if (!process.env.GEMINI_API_KEY) {
      res.json(fallback);
      return;
    }

    const prompt = [
      `Victorious Hero: ${body.playerName || 'Runner'} (${body.className || 'Operative'})`,
      `Weapon Used: ${body.weaponName || 'Blade'}, Armor Used: ${body.armorName || 'Plating'}`,
      `Battle Telemetry: ${body.turnsTaken ?? 1} turns, ${body.potionsUsed ?? 0} potions used, ${body.hpRemaining ?? 1}/${body.maxHp ?? 30} HP remaining`,
      `Run Score: ${body.score ?? 0}, Gold Carried: ${body.gold ?? 0}`,
      `Forge a unique Legendary Weapon dropped by the defeated Zenexis Overlord tailored to this battle.`,
    ].join('\n');

    try {
      const response = await generateWithModelFallback({
        model: PRIMARY_MODEL,
        contents: prompt,
        config: {
          systemInstruction:
            'You are a dark-fantasy cyberpunk relic smith. Generate a unique Legendary Weapon drop tailored to how the hero defeated the Zenexis Overlord. Return JSON matching the schema: name (2-4 epic words), description (1-2 vivid lore sentences referencing the battle), bonusAtk (integer between 4 and 8), loreTag (short 2-4 word tag).',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              bonusAtk: { type: Type.INTEGER },
              loreTag: { type: Type.STRING },
            },
            required: ['name', 'description', 'bonusAtk', 'loreTag'],
          },
        },
      });

      const raw = (response.text ?? '').trim();
      const parsed = JSON.parse(raw) as {
        name?: string;
        description?: string;
        bonusAtk?: number;
        loreTag?: string;
      };

      if (!parsed.name || !parsed.description) {
        res.json(fallback);
        return;
      }

      res.json({
        name: parsed.name.slice(0, 48),
        description: parsed.description.slice(0, 240),
        bonusAtk: Math.max(4, Math.min(8, Math.round(parsed.bonusAtk ?? 5))),
        loreTag: (parsed.loreTag || 'Boss Relic · Floor 3').slice(0, 32),
        source: 'gemini',
      });
    } catch {
      res.json(fallback);
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rogue Byte server running at http://localhost:${PORT}`);
  });
}

createApp();
