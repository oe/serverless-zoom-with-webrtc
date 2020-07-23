module.exports = {
  envId: 'tcb-demo-10cf5b',
  "framework": {
    "plugins": {
      "client": {
        "use": "@cloudbase/framework-plugin-website",
        "inputs": {
          "buildCommand": "npm run build",
          "outputPath": "dist",
          "cloudPath": "/online-meeting"
        }
      },
      "server": {
        "use": "@cloudbase/framework-plugin-function",
        "inputs": {
          "functionRootPath": "functions",
          "functions": [
            {
              "name": "clear-session"
            },
            {
              "name": "get-session"
            },
            {
              "name": "join-session"
            },
            {
              "name": "create-session"
            }
          ]
        }
      }
    }
  }
}