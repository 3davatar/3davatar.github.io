import { VRMLoaderPlugin } from "@pixiv/three-vrm";

let GLTFLoader;
if (typeof window === 'undefined') {
  // This means we are in a Node.js environment
  import('./node-three-gltf.js').then(module => {
    GLTFLoader = module.GLTFLoader;
  });
} else {
  // This means we are in a browser environment
  import('three/examples/jsm/loaders/GLTFLoader.js').then(module => {
    GLTFLoader = module.GLTFLoader;
  });
}
// make a class that hold all the informarion
let gltfLoader;

export const getGltfLoader = async () => {
  if (gltfLoader) {
    return gltfLoader;
  } else {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (GLTFLoader) {
          clearInterval(interval);
          gltfLoader = new GLTFLoader();
          gltfLoader.crossOrigin = 'anonymous';
          gltfLoader.register((parser) => {
            // return new VRMLoaderPlugin(parser, {autoUpdateHumanBones: true, helperRoot:vrmHelperRoot})
            // const springBoneLoader = new VRMSpringBoneLoaderPlugin(parser);
            // return new VRMLoaderPlugin(parser, {autoUpdateHumanBones: true, springBonePlugin:springBoneLoader})
            return new VRMLoaderPlugin(parser, {autoUpdateHumanBones: true})
        })
          resolve(gltfLoader);
        }
      }, 10);
    });
  }
};
