# SonicFrame Studio — Studio-Grade Audio & Post-Production Client Review

> **Frame.io for Audio Mixing Engineers, Re-Recording Stages, and Sound Supervisors.**  
> Real-time SMPTE waveform review, A/B loudness-matched auditioning, and one-click Cockos REAPER marker synchronization.

---

## 🎧 Overview & Problem Statement

In television, film, and commercial post-production, audio review cycles are notoriously fragile:
1. **Loudness Cognitive Bias**: Unmastered mix passes ("v1 Rough Cut") sound quiet (-18 to -24 LUFS), causing directors and showrunners to perceive them as "lacking energy" compared to mastered references (-14 LUFS).
2. **Ambiguous Feedback**: Reviewers send email bullet points with imprecise timestamps (e.g., *"around 1:14 there is a harsh hiss"*), forcing engineers to hunt across 100+ DAW tracks.
3. **Manual DAW Marker Entry**: Engineers spend hours manually copying timecodes into Pro Tools or REAPER session markers.

**SonicFrame Studio** eliminates this friction with millisecond-accurate timeline pin flags, instantaneous A/B loudness-matched version switching, real-time Web Audio reference synthesis, and direct Cockos REAPER marker CSV export.

---

## 🏛️ System Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Reviewer as Client / Director
    participant Web as Next.js Web Client (SonicFrame)
    participant PresignAPI as Presign API (/api/storage/presign)
    participant Wasabi as Wasabi / AWS S3 Storage
    participant WebAudio as Web Audio Synth Engine
    participant CommentsAPI as Comments API (/api/comments)
    actor Mixer as Re-Recording Mixer (DAW)

    Reviewer->>Web: Audition Deliverable (Episode 04)
    Web->>WebAudio: Synthesize D min 9th Harmonic Reference Chord
    Reviewer->>Web: Toggle A/B (v1 Rough Cut vs v2 Loudness Matched)
    Web->>Web: Dynamically morph 140 waveform bar heights & EQ filters
    Reviewer->>Web: Pin Revision Flag at 00:14.250 [MIX: Sibilance at 4.8kHz]
    Web->>CommentsAPI: POST /api/comments { timeMs: 14250, tag: "MIX" }
    CommentsAPI-->>Web: 201 Created (Pinned to timeline)

    Reviewer->>Web: Click "Export REAPER Markers (.CSV)"
    Web->>Web: Filter unresolved comments & generate REAPER CSV format
    Web-->>Reviewer: Download "sonicframe_episode04_reaper_markers.csv"
    Reviewer->>Mixer: Deliver Marker CSV
    Mixer->>Mixer: REAPER > Region/Marker Manager > Import
```

---

## ⚡ Key Engineering Decisions

### 1. Zero-SDK Native S3 / Wasabi HMAC-SHA256 Presigning
- Implemented in [`src/app/api/storage/presign/route.ts`](src/app/api/storage/presign/route.ts) using Node's built-in `crypto` module.
- Eliminates the heavy `@aws-sdk/s3-request-presigner` and `@aws-sdk/client-s3` dependency tree, saving bundle size and cold-start latency while maintaining 100% AWS Signature Version 4 compliance.

### 2. Deterministic 140-Bar Waveform Timeline
- Generates 140 peak bars utilizing deterministic sine arc and pseudo-random noise mapping.
- Dynamically scales peak heights between:
  - **v1 Rough Cut**: Raw peaks, higher dynamic fluctuation, -18.4 LUFS.
  - **v2 Loudness Matched**: Compressed ceiling, fuller mid-frequency density, -14.1 LUFS (EBU R128 / Netflix delivery spec).

### 3. Web Audio API Reference Tone Synthesis
- Implemented in [`src/lib/audioEngine.ts`](src/lib/audioEngine.ts).
- Produces a multi-oscillator `D minor 9th` chord (D2, A2, F3, C4, E4) with sub-bass reinforcement and dynamic biquad filtering.
- Reviewers audition real sound instantly without waiting for multi-hundred megabyte WAV downloads.

### 4. Direct Cockos REAPER Marker CSV Specification
- Complies with Cockos REAPER's standard marker import specification:
  ```csv
  #, Name, Start, End, Length, Color
  M1, "[MIX] Sarah Chen (Director): Check high-end sibilance around 4.8kHz...", 00:00:14.250, 00:00:14.250, 00:00:00.000, #F59E0B
  M2, "[FOLEY] Marcus Vance (Sound Supervisor): Door latch Foley cue off-sync...", 00:00:28.800, 00:00:28.800, 00:00:00.000, #10B981
  ```
- Tag colors automatically map to distinct hex identifiers for instant DAW visual clarity:
  - **MIX**: Amber (`#F59E0B`)
  - **FOLEY**: Emerald (`#10B981`)
  - **BGM**: Purple (`#8B5CF6`)
  - **DIALOGUE**: Cyan (`#06B6D4`)

### 5. PostgreSQL Schema & Indexing (Prisma)
- Defined in [`prisma/schema.prisma`](prisma/schema.prisma) with models for:
  - `Workspace`
  - `DeliverableAsset` (indexed on `[workspaceId, status]` and `[createdAt]`)
  - `AssetVersion` (storing `lufsIntegrated`, `peakDb`, and `waveformPeaks Json`)
  - `TimecodeComment` (indexed on `[assetId, timestampMs]` and `[assetId, isResolved]`)

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Node.js >= 18
- npm or pnpm

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/your-username/sonicframe-studio.git
cd sonicframe-studio

# Start Next.js development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the landing page or [http://localhost:3000/review/demo](http://localhost:3000/review/demo) to jump directly into the Studio Workspace.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/sonicframe_studio?schema=public"

WASABI_ACCESS_KEY_ID="your_wasabi_or_aws_access_key"
WASABI_SECRET_ACCESS_KEY="your_wasabi_or_aws_secret_key"
WASABI_REGION="us-east-1"
WASABI_ENDPOINT="s3.wasabisys.com"
WASABI_BUCKET="sonicframe-deliverables-prod"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4, Lucide React
- **Audio Engine**: Web Audio API (Multi-oscillator harmonic drone + BiquadFilter)
- **Storage**: AWS Signature V4 HMAC-SHA256 (Native Node.js `crypto`)
- **Database Schema**: Prisma ORM (PostgreSQL)

---

## 📄 License
MIT License. Built for modern sound engineers and post-production studios.
