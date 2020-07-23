module.exports = {
  envId: 'tcb-demo-10cf5b',

  "framework": {
    "plugins": {
      // "client": {
      //   "use": "@cloudbase/framework-plugin-website",
      //   "inputs": {
      //     "buildCommand": "npm run build",
      //     "outputPath": "dist",
      //     "cloudPath": "/online-meeting"
      //   }
      // },
      "server": {
        "use": "@cloudbase/framework-plugin-function",
        "inputs": {
          "functionRootPath": "functions",
          "functions": [
            {
              name: "clear-session",
              timeout: 5,
              runtime: 'Nodejs10.15',
              memorySize: 128,
              installDependency: true
            },
            {
              "name": "get-session",
              timeout: 5,
              runtime: 'Nodejs10.15',
              memorySize: 128,
              installDependency: true
            },
            {
              name: "join-session",
              timeout: 5,
              runtime: 'Nodejs10.15',
              memorySize: 128,
              installDependency: true
            },
            {
              name: "create-session",
              timeout: 5,
              runtime: 'Nodejs10.15',
              memorySize: 128,
              installDependency: true
            }
          ]
        }
      }
    }
  }
}