## 2.0.0-beta.1 (Aug 10, 2018)

#### :house: Internal
* Regression testing passed.
* Provide another data provider based on our Signaling SDK. [What is data provider](https://agoraio.github.io/ARD-eEducation-with-Electron/#/en/concepts?id=data-provider)



## 2.0.0-alpha (July 31, 2018)

#### :memo: Documentation
[New doc center](https://agoraio.github.io/ARD-eEducation-with-Electron/#/) now accessible!

#### :house: Internal
* No longer use mobx any more. Now we provide a more scalable architecture. Go to [Doc Center](https://agoraio.github.io/ARD-eEducation-with-Electron/#/) for more detail.

* Remove lots of redundant third-party lib and refactor project structure.

* Provide some useful component for e-Edu under '/client/app/components' (Chatroom, UserList, ClassControl), run `npm run storybook` to preview.

* Use ErrorBoundary to optimize robust.

* Provide two independent services (room control and recording) and deploy them on our server, just for reference.