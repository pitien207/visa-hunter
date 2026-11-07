import { useEffect } from 'react'
import { Game } from './game/Game'
import { installDebugHooks } from './game/systems/debug'
import { bindKeyboard } from './game/systems/input'
import { useSettings } from './store/settingsStore'
import { ActionButtons } from './ui/ActionButtons'
import { BagPanel } from './ui/BagPanel'
import { CarePanel, CareResults } from './ui/CarePanel'
import { ClothesPanel } from './ui/ClothesPanel'
import { MinigameHost } from './game/minigames/MinigameHost'
import { QuestLog } from './ui/QuestLog'
import { TransitionOverlay } from './ui/TransitionOverlay'
import { VisaPanel } from './ui/VisaPanel'
import { ClockPanel } from './ui/ClockPanel'
import { FastForwardOverlay, LocationCard, NewDayCard } from './ui/TimeOverlays'
import { ControlsHint } from './ui/ControlsHint'
import { DialogueBox } from './ui/DialogueBox'
import { HUD } from './ui/HUD'
import { Joystick } from './ui/Joystick'
import { LoadingScreen } from './ui/LoadingScreen'
import { SettingsPanel } from './ui/SettingsPanel'
import { ShopPanel } from './ui/ShopPanel'
import { SleepOverlay } from './ui/SleepOverlay'
import { Toasts } from './ui/Toasts'
import { WorkPanel } from './ui/WorkPanel'
import { WorkResults } from './ui/WorkResults'

installDebugHooks()

export default function App() {
  const language = useSettings((s) => s.language)

  useEffect(() => bindKeyboard(), [])
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Game />
      {/* DOM overlay. Containers ignore pointers so drags fall through to the 3D view. */}
      <div className="pointer-events-none absolute inset-0">
        <HUD />
        <ControlsHint />
        <LocationCard />
        <WorkPanel />
        <CarePanel />
        <Joystick />
        <ActionButtons />
        <DialogueBox />
        <Toasts />
        <WorkResults />
        <CareResults />
        <ShopPanel />
        <ClothesPanel />
        <BagPanel />
        <QuestLog />
        <VisaPanel />
        <ClockPanel />
        <MinigameHost />
        <SettingsPanel />
        <FastForwardOverlay />
        <SleepOverlay />
        <NewDayCard />
        <TransitionOverlay />
      </div>
      <LoadingScreen />
    </div>
  )
}
