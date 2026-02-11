'use client';

import React from 'react';
import { TeamImagesSectionEditor } from './team-images-section-editor';

interface TeamSectionData {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  teamImages: Array<{
    id: string;
    description: string;
    imageUrl: string;
    imageHint: string;
  }>;
  styling: {
    padding?: string;
    textColor?: string;
    backgroundColor?: string;
    buttonStyle?: {
      size?: string;
      variant?: string;
      textColor?: string;
      backgroundColor?: string;
      hoverBackgroundColor?: string;
    };
  };
}

interface TeamSectionEditorProps {
  data: TeamSectionData;
  onChange: (data: TeamSectionData) => void;
  onSave?: () => void;
}

export function TeamSectionEditor({ data, onChange, onSave }: TeamSectionEditorProps) {
  return (
    <TeamImagesSectionEditor
      data={data}
      onChange={onChange}
      onSave={onSave}
    />
  );
}
