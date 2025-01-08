const core = require('@actions/core');
const { getOctokit } = require('@actions/github');
const fs = require('fs');

async function run() {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GITHUB_TOKEN is missing');

    const github = getOctokit(token);

    // Get inputs
    const uploadUrl = core.getInput('upload_url', { required: true });
    const assetPath = core.getInput('asset_path', { required: true });
    const assetName = core.getInput('asset_name', { required: true });
    const assetContentType = core.getInput('asset_content_type', { required: true });

    // Determine content-length for the file
    const contentLength = fs.statSync(assetPath).size;

    // Upload asset
    const uploadAssetResponse = await github.rest.repos.uploadReleaseAsset({
      url: uploadUrl,
      headers: {
        'content-type': assetContentType,
        'content-length': contentLength
      },
      name: assetName,
      data: fs.createReadStream(assetPath) // Use stream for uploading large files
    });

    core.info(`Upload Response: ${JSON.stringify(uploadAssetResponse)}`);

    const { browser_download_url: browserDownloadUrl, url } = uploadAssetResponse.data;

    core.setOutput('browser_download_url', browserDownloadUrl);
    core.setOutput('url', url);
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;
