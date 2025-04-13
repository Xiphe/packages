/** @type {import('semantic-release').Options} */
export default {
  branches: [
    "+([0-9])?(.{+([0-9]),x}).x",
    "main",
    {
      name: "beta",
      prerelease: true,
    },
    {
      name: "alpha",
      prerelease: true,
    },
  ],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/npm",
      {
        npmPublish: false,
      },
    ],
    // "@semantic-release/github",
  ],
};
