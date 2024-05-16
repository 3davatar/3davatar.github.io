import * as THREE from "three"
import { getVectorCameraPosition, saveTextFile } from "./utils";
import { ZipManager } from "./zipManager";
const localVector3 = new THREE.Vector3();

export class LoraDataGenerator {
    constructor(characterManager){
        this.characterManager = characterManager;
        this.screenshotManager = characterManager.screenshotManager;
        this.blinkManager = characterManager.blinkManager;
        this.animationManager = this.characterManager.animationManager;

        this.temptime = 0;
    }

    async createLoraData(loraObject, zipName = "", baseText){
        const manifestURL = loraObject.manifest;
        const loraFolderName = loraObject.name || "lora_Data";
        const manifest = await this._fetchManifest(manifestURL);
        const {

            assetsLocation = "",
            animationsDirectory = "",
            backgroundGrayscale = 1,
            topFrameOffsetPixels = 64,
            bottomFrameOffsetPixels = 64,
            backgroundDescription ="",
            width = 512,
            height = 512,
            dataCollection
        } = manifest
        const animBasePath = assetsLocation + animationsDirectory + "/";
        const normalizedTopOffset = topFrameOffsetPixels/height;
        const normalizedBottomOffset = bottomFrameOffsetPixels/height;

        this.screenshotManager.setBackground([backgroundGrayscale,backgroundGrayscale,backgroundGrayscale])
        this.blinkManager.enableScreenshot();

        this.screenshotManager._calculateBoneOffsets(0.2);
        const delay = ms => new Promise(res => setTimeout(res, ms));
        let counter = 0;
        const scope = this;
        if (Array.isArray(dataCollection)){
            const zip = new ZipManager();
            const processAnimations = async() =>{
                if (Array.isArray(dataCollection)) {
                    for (let i =0; i < dataCollection.length;i++){
                        const {
                            animationPath,
                            animationTime = 0,
                            animationFrame,
                            lookAtCamera,
                            expression,
                            cameraPosition,
                            cameraFrame,
                            description
                        } = dataCollection[i];
                        counter++
                        const saveName = counter.toString().padStart(4, '0');
                        const finalAnimationTime = animationFrame ? animationFrame/30 : animationTime
                        await scope.animationManager.loadAnimation(animBasePath + animationPath, true, finalAnimationTime);
                        
                        const vectorCameraPosition = getVectorCameraPosition(cameraPosition);
                        scope.screenshotManager.setCameraFrameWithName(cameraFrame,vectorCameraPosition);
            
                        // add small delay to avoid skipping saves
                        //await delay(100);
                        //scope.screenshotManager.saveScreenshot(saveName, width, height);
                        const imgData = scope.screenshotManager.getImageData(width, height, false);
                        zip.addData(imgData,saveName, "png", loraFolderName);
                        zip.addData("anata" + " " + description + " " + backgroundDescription,saveName, "txt", loraFolderName)
                        //saveTextFile("anata" + " " + description + " " + backgroundDescription,saveName);
                    }
                }
            }
            
            
            
            // Call the function to start processing animations
            await processAnimations();

            if (zipName == "")
                zipName = "lora_zip"; 
            zip.saveZip(zipName);
        }

        this.blinkManager.disableScreenshot();
    }

    async _fetchManifest(location) {
        const response = await fetch(location)
        const data = await response.json()
        return data
    }

    
}