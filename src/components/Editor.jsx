import React, { useContext } from "react"

import useSound from 'use-sound';
import gsap from 'gsap';
import shuffle from "../../public/ui/traits/shuffle.png";
import { BackButton } from "./BackButton";
import optionClick from "../../public/sound/option_click.wav"
import { ViewContext } from "../context/ViewContext";
import { AudioContext } from "../context/AudioContext";
import { SceneContext } from "../context/SceneContext";
import { ViewStates } from "../context/ViewContext";

import styles from './Editor.module.css'

export default function Editor({templateInfo, controls}) {
  const {currentTrait, setCurrentTrait} = useContext(SceneContext);

  const {isMute} = useContext(AudioContext);

  const [cameraFocused, setCameraFocused] = React.useState(false);

  const [play] = useSound(
    optionClick,
    { volume: 1.0 }
  );

  const selectOption = (option) => {
    console.log('selectOption', option.name, currentTrait)
    if (option.name == currentTrait){ 
      if (cameraFocused) {
        moveCamera(option.cameraTarget);
        setCameraFocused(false);
      }
      else{ 
        moveCamera({height:0.8, distance:3.2});
        setCameraFocused(true);
      }
    }

    if (option.name != currentTrait)
      moveCamera(option.cameraTarget);
    setCurrentTrait(option.name)
    
    !isMute && play();
  }

  const moveCamera = (value) => {
    if (value){

      gsap.to(controls.target,{
        y:value.height,
        duration: 1,
      })

      gsap.fromTo(controls,
        {
          maxDistance:controls.getDistance(),
          minDistance:controls.getDistance(),
          minPolarAngle:controls.getPolarAngle(),
          maxPolarAngle:controls.getPolarAngle(),
          minAzimuthAngle:controls.getAzimuthalAngle(),
          maxAzimuthAngle:controls.getAzimuthalAngle(),
        },
        {
          maxDistance:value.distance,
          minDistance:value.distance,
          minPolarAngle:(Math.PI / 2 - 0.11),
          maxPolarAngle:(Math.PI / 2 - 0.11),
          minAzimuthAngle: - 0.78,
          maxAzimuthAngle: - 0.78,
          duration: 1,
        }
      ).then(()=>{
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = 3.1415;
        controls.minDistance = 0.5;
        controls.maxDistance = 5;
        controls.minAzimuthAngle = Infinity;
        controls.maxAzimuthAngle = Infinity;
      })
    }
  }

  const { setCurrentView } = useContext(ViewContext)

  const {
    setCurrentTemplate,
  } = useContext(SceneContext)

  return(
  <div className={styles['SideMenu']}>
        <div className={styles['MenuTitle']}>
        <BackButton onClick={() => {
          setCurrentTemplate(null)
          setCurrentView(ViewStates.LANDER_LOADING)
          console.log('ViewStates.LANDER_LOADING', ViewStates.LANDER_LOADING)
        }}/>
        </div>

        <div className={styles['LineDivision']} bottom = {'20px'}/>

        { templateInfo.selectionTraits && templateInfo.selectionTraits.map((item, index) => (
          // improve id
          <div className={styles['MenuOption']}
            onClick = {()=>{
              selectOption(item)
            }} 
            selected = {currentTrait === item.name}
            key = {index}>  
            <div className={styles['MenuImg']} src = {templateInfo.traitIconsDirectory + item.icon} />
          </div>
        ))}

        <div className={styles['LineDivision']} top = {'20px'}/>

        <div className={styles['ShuffleOption']} 
          onClick={() => {
            console.log("TODO: shuffle")
            !isMute && play();
          }}>
          <div className={styles['MenuImg']} src = {shuffle} />
        </div>
  </div>);
}
