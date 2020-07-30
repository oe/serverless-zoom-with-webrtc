module.exports = {
  envId: 'tcb-demo-10cf5b',
  framework: {
    plugins: {
      client: {
        use: '@cloudbase/framework-plugin-website',
        inputs: {
          buildCommand: 'npm run build',
          outputPath: 'build',
          cloudPath: '/online-meeting/'
        }
      },
      db: {
        use: '@cloudbase/framework-plugin-database',
        inputs: {
          collections: [
            {
              collectionName: 'sessions',
              aclTag: 'READONLY'
            }
          ]
        }
      },
      server: {
        use: '@cloudbase/framework-plugin-function',
        inputs: {
          functionRootPath: 'functions',
          functions: [
            {
              name: 'clear-session'
            },
            {
              name: 'get-session'
            },
            {
              name: 'join-session'
            },
            {
              name: 'create-session'
            },
            {
              name: 'update-ticket'
            }
          ]
        }
      }
    }
  }
};
