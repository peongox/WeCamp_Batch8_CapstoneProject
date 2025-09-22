const newman = require('newman');
const path = require('path');

// Get the project root directory 
const projectRoot = path.resolve(__dirname, '../../');

newman.run({
    collection: path.join(projectRoot, 'api_test', 'collections', 'Users.postman_collection.json'),
    environment: path.join(projectRoot, 'api_test', 'environment', 'ProShop.postman_environment.json'),
    reporters: ['htmlextra'],
    iterationCount: 1,
    reporter: {
        htmlextra: {
            export: '../exports/report.html',
            // template: './template.hbs'
            // logs: true,
            // showOnlyFails: true,
            // noSyntaxHighlighting: true,
            // testPaging: true,
            browserTitle: "API Test Report",
            title: "WeCamp Batch 8 Capstone Project API Test Report",
            // titleSize: 4,
            // omitHeaders: true,
            // skipHeaders: "Authorization",
            // omitRequestBodies: true,
            // omitResponseBodies: true,
            // hideRequestBody: ["Login"],
            // hideResponseBody: ["Auth Request"],
            // showEnvironmentData: true,
            // skipEnvironmentVars: ["API_KEY"],
            // showGlobalData: true,
            // skipGlobalVars: ["API_TOKEN"],
            // skipSensitiveData: true,
            // showMarkdownLinks: true,
            // showFolderDescription: true,
            // timezone: "Vietnam/Hanoi",
            // skipFolders: "folder name with space,folderWithoutSpace",
            // skipRequests: "request name with space,requestNameWithoutSpace",
            // displayProgressBar: true
        }
    }
});