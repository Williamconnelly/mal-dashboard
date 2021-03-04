import { InjectionToken } from '@angular/core';

export const THEMES = new InjectionToken('THEMES');

export const ACTIVE_THEME = new InjectionToken('ACTIVE_THEME');

export interface Theme {
  name: string,
  properties: {
    '--background': string,
    '--background-text': string,
    '--primary': string,
    '--primary-text': string,
    '--secondary': string,
    '--secondary-text': string,
    '--surface': string,
    '--surface-text': string
  }
};

export const devTheme: Theme = {
  name: 'Developer',
  properties: {
    '--background': '#070720',
    '--background-text': '#fff',
    '--primary': '#08a6ff',
    '--primary-text': '#fff',
    '--secondary': '#31334a',
    '--secondary-text': '#fff',
    '--surface': '#17172e',
    '--surface-text': '#fff'
  }
}

export const malTheme: Theme = {
  name: 'MyAnimeList',
  properties: {
    '--background': '#ffffff',
    '--background-text': '#000000',
    '--primary': '#2e51a2',
    '--primary-text': '#ffffff',
    '--secondary': '#e1e7f5',
    '--secondary-text': '#000000',
    '--surface': '#ffffff',
    '--surface-text': '#000000'
  }
}

export const payprTheme: Theme = {
  name: 'payprTheme',
  properties: {
    '--background': 'black',
    '--background-text': '#fff',
    '--primary': '#C3073F',
    '--primary-text': '#fff',
    '--secondary': '#950740',
    '--secondary-text': '#fff',
    '--surface': '#1A1A1D',
    '--surface-text': '#fff'
  }
}

export interface ThemeOptions {
  themes: Theme[];
  active: string;
}