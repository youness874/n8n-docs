import { createProjectAction } from '@/app/actions/projects';

export default function NewProjectPage() {
  return (
    <section>
      <h1>New project</h1>
      <form action={createProjectAction}>
        <label htmlFor="name">Project name</label>
        <input id="name" name="name" required />

        <label htmlFor="targetAudience">Target audience</label>
        <input id="targetAudience" name="targetAudience" required />

        <label htmlFor="language">Language</label>
        <input id="language" name="language" defaultValue="en" required />

        <label htmlFor="tone">Tone</label>
        <input id="tone" name="tone" required />

        <label htmlFor="objective">Video objective</label>
        <input id="objective" name="objective" required />

        <label htmlFor="approximateDurationSeconds">Approximate length (seconds)</label>
        <input
          id="approximateDurationSeconds"
          name="approximateDurationSeconds"
          type="number"
          min={1}
        />

        <label htmlFor="userInstructions">Additional instructions (optional)</label>
        <textarea id="userInstructions" name="userInstructions" rows={4} />

        <button type="submit">Create project</button>
      </form>
    </section>
  );
}
