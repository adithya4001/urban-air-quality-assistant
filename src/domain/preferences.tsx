import React, { createContext, useContext } from 'react';

export type Preferences = { textSize:'normal'|'large'; reduceMotion:boolean; compact:boolean; temperature:'c'|'f'; wind:'kmh'|'mph'; clock:'24'|'12'; weatherMetric:'temperature'|'precipitation'|'wind'; chartInterval:'3'|'6'; refreshMinutes:'15'|'30'|'60'|'off'; quickQuestions:boolean; replyDetails:boolean; autoRead:boolean; sidebarDefault:'open'|'closed' };
export const defaultPreferences: Preferences = { textSize:'normal', reduceMotion:false, compact:false, temperature:'c', wind:'kmh', clock:'24', weatherMetric:'temperature', chartInterval:'3', refreshMinutes:'30', quickQuestions:true, replyDetails:true, autoRead:false, sidebarDefault:'open' };
export const PreferencesContext = createContext<{ prefs:Preferences; update:(changes:Partial<Preferences>)=>void }>({prefs:defaultPreferences,update:()=>{}});
export const usePreferences = () => useContext(PreferencesContext);
export function readPreferences(userId:string): Preferences { try { return {...defaultPreferences,...JSON.parse(localStorage.getItem(`vaayudootha.preferences.${userId}`) || '{}')}; } catch { return defaultPreferences; } }
export function PreferencesProvider({value,children}:{value:{prefs:Preferences;update:(changes:Partial<Preferences>)=>void};children:React.ReactNode}) { return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>; }
