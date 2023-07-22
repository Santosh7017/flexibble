import { g, auth, config } from '@grafbase/sdk'

const user = g.model('user', {
  name: g.string().length({min:2, max:20}),
  email: g.string().unique(),
  awatarUrl: g.url(),
  description: g.string().optional(),
  githubUrl: g.url().optional(),
  linkedinUrl: g.url(),
  projects: g.relation(() => Project ).list().optional(),
});

const Project = g.model('Project', {
  title: g.string().length({min:2}),
  description: g.string(),
  image: g.url(),
  liveSiteUrl: g.url(),
  githubUrl: g.url(),
  category: g.string().search(),
  createdBy: g.relation(() => user),
})

export default config({
  schema: g
 
})
