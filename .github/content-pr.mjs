// @ts-check

/**
 * @param {ReturnType<typeof import('@actions/github').getOctokit>} github
 */
export async function createOrUpdateContentPR(github) {
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) {
    throw new Error("GITHUB_REPOSITORY is not set");
  }
  const contentUpdateBranch = "update-content";
  const baseBranch = "main";
  const pulls = await github.rest.search.issuesAndPullRequests({
    q: `repo:${repo}+state:open+head:${contentUpdateBranch}+base:${baseBranch}+is:pull-request`,
    per_page: 1,
  });
  if (pulls.data.items.length) {
    const pr = pulls.data.items[0];
    console.log(`PR already exists: ${pr.html_url}`);
    return;
  }
  const [owner, repoName] = repo.split("/");

  const pull = await github.rest.pulls.create({
    base: baseBranch,
    head: contentUpdateBranch,
    owner,
    repo: repoName,
    title: "Update content",
  });
  await github.graphql(
    gql`
      mutation ($id: ID!) {
        enablePullRequestAutoMerge(
          input: { pullRequestId: $id, mergeMethod: REBASE }
        ) {
          clientMutationId
        }
      }
    `,
    { id: pull.data.node_id }
  );
}

// this is just for syntax highlighting and formatting
/**
 *
 * @param {TemplateStringsArray} strings
 */
const gql = ([content]) => content;
