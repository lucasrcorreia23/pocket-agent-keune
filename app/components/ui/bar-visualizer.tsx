'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export type AgentState =
  | 'connecting'
  | 'initializing'
  | 'listening'
  | 'speaking'
  | 'thinking';

export interface AudioAnalyserOptions {
  fftSize?: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
}

export interface MultiBandVolumeOptions {
  bands?: number;
  loPass?: number;
  hiPass?: number;
  updateInterval?: number;
}

export interface BarVisualizerProps {
  state: AgentState;
  barCount?: number;
  minHeight?: number;
  maxHeight?: number;
  mediaStream?: MediaStream | null;
  demo?: boolean;
  centerAlign?: boolean;
  className?: string;
  frequencyBands?: number[];
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const createBands = (count: number, fillValue = 0) =>
  Array.from({ length: count }, () => fillValue);

export function useAudioVolume(
  mediaStream: MediaStream | null,
  options: AudioAnalyserOptions = {},
) {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    if (!mediaStream) {
      setVolume(0);
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = options.fftSize ?? 256;
    analyser.smoothingTimeConstant = options.smoothingTimeConstant ?? 0.8;
    analyser.minDecibels = options.minDecibels ?? -80;
    analyser.maxDecibels = options.maxDecibels ?? -10;

    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);
    let rafId = 0;

    const update = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i += 1) {
        const value = (data[i] - 128) / 128;
        sum += value * value;
      }
      const rms = Math.sqrt(sum / data.length);
      setVolume(clamp(rms, 0, 1));
      rafId = requestAnimationFrame(update);
    };

    update();

    return () => {
      cancelAnimationFrame(rafId);
      source.disconnect();
      analyser.disconnect();
      audioContext.close();
      analyserRef.current = null;
      audioContextRef.current = null;
    };
  }, [mediaStream, options.fftSize, options.maxDecibels, options.minDecibels, options.smoothingTimeConstant]);

  return volume;
}

export function useMultibandVolume(
  mediaStream: MediaStream | null,
  options: MultiBandVolumeOptions = {},
) {
  const analyserOptions: AudioAnalyserOptions = useMemo(
    () => ({
      fftSize: 256,
      smoothingTimeConstant: 0.8,
    }),
    [],
  );
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [bands, setBands] = useState<number[]>([]);

  useEffect(() => {
    if (!mediaStream) {
      setBands([]);
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = analyserOptions.fftSize ?? 256;
    analyser.smoothingTimeConstant = analyserOptions.smoothingTimeConstant ?? 0.8;

    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);
    let rafId = 0;

    const update = () => {
      analyser.getByteFrequencyData(data);
      const bandCount = options.bands ?? 15;
      const nextBands = createBands(bandCount);
      for (let i = 0; i < bandCount; i += 1) {
        const start = Math.floor(Math.pow(i / bandCount, 1.3) * data.length);
        const end = Math.max(
          start + 1,
          Math.floor(Math.pow((i + 1) / bandCount, 1.3) * data.length),
        );
        let sum = 0;
        for (let j = start; j < end; j += 1) {
          sum += data[j];
        }
        const avg = sum / Math.max(1, end - start);
        nextBands[i] = clamp(Math.pow(avg / 255, 1.1), 0, 1);
      }
      setBands(nextBands);
      rafId = requestAnimationFrame(update);
    };

    update();

    return () => {
      cancelAnimationFrame(rafId);
      source.disconnect();
      analyser.disconnect();
      audioContext.close();
      analyserRef.current = null;
      audioContextRef.current = null;
    };
  }, [mediaStream, options.bands, analyserOptions.fftSize, analyserOptions.smoothingTimeConstant]);

  return bands;
}

export function useBarAnimator(state: AgentState, columns: number, interval = 100) {
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([]);

  useEffect(() => {
    let frame = 0;
    const timer = setInterval(() => {
      frame += 1;
      if (state === 'connecting' || state === 'initializing') {
        const index = frame % columns;
        setHighlightedIndices([index, (index + 1) % columns]);
      } else if (state === 'thinking') {
        const index = Math.floor((Math.sin(frame / 4) + 1) * (columns / 2));
        setHighlightedIndices([index]);
      } else if (state === 'speaking') {
        setHighlightedIndices(
          createBands(columns).map((_, idx) => idx).filter((idx) => idx % 2 === frame % 2),
        );
      } else {
        setHighlightedIndices([]);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [columns, interval, state]);

  return highlightedIndices;
}

export function BarVisualizer({
  state,
  barCount = 15,
  minHeight = 20,
  maxHeight = 100,
  demo = false,
  centerAlign = false,
  className = '',
  frequencyBands,
  mediaStream,
}: BarVisualizerProps) {
  const [demoBands, setDemoBands] = useState<number[]>(createBands(barCount, 0.2));
  const hasExternalBands = useMemo(
    () => Boolean(frequencyBands && frequencyBands.length),
    [frequencyBands],
  );
  const streamBands = useMultibandVolume(mediaStream ?? null, {
    bands: barCount,
  });

  useEffect(() => {
    if (!demo || hasExternalBands) return;
    let rafId = 0;
    const update = () => {
      const time = Date.now() / 1000;
      const base =
        state === 'speaking'
          ? 0.7
          : state === 'listening'
          ? 0.35
          : state === 'thinking'
          ? 0.45
          : 0.25;
      const next = createBands(barCount).map((_, i) => {
        const wave = Math.sin(time * 3 + i * 0.6);
        return clamp(base + wave * 0.18, 0.05, 1);
      });
      setDemoBands(next);
      rafId = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(rafId);
  }, [barCount, demo, hasExternalBands, state]);

  const bands = useMemo(() => {
    const source =
      (hasExternalBands
        ? frequencyBands
        : mediaStream
        ? streamBands
        : demo
        ? demoBands
        : []) ?? [];
    const padded = createBands(barCount).map((_, i) => clamp(source[i] ?? 0, 0, 1));
    return padded;
  }, [barCount, demo, demoBands, frequencyBands, hasExternalBands, mediaStream, streamBands]);

  return (
    <div
      className={`flex w-full ${centerAlign ? 'items-center' : 'items-end'} gap-1 ${className}`}
      aria-label={`Bar visualizer - ${state}`}
    >
      {bands.map((value, index) => {
        const height = minHeight + (maxHeight - minHeight) * value;
        const isActive = value > 0.08;
        const fillColor = isActive ? 'rgba(46, 99, 205, 0.85)' : 'transparent';
        const borderColor = isActive ? 'rgba(46, 99, 205, 0.65)' : 'rgba(148, 163, 184, 0.6)';
        return (
          <div
            key={`${state}-${index}`}
            className="flex-1 rounded-full transition-all duration-100 border"
            style={{
              height: `${height}%`,
              backgroundColor: fillColor,
              borderColor,
            }}
          />
        );
      })}
    </div>
  );
}
