*tools*
--------
shadcn ->
    npx shadcn@2.5.0     
    npx shadcn@2.5.0 init           ->{netural  , Use --legacy-peer-deps}
    npx shadcn@2.5.0 add --all.     ->{add all the component eg:button,table and remove the unwanted later}
    npm install @tanstack/react-table --legacy-peer-deps    -> for installing data table

database -> https://neon.com (postgress)

DrizzleOrm ->
    npm i drizzle-orm@0.43.1 @neondatabase/serverless@1.0.0 dotenv@16.5.0 --legacy-peer-deps
    npm i -D drizzle-kit@0.31.1 tsx@4.19.4 --legacy-peer-deps
    npx drizzle-kit push ---> (to apply changes to database "adding tables from code to db etc ..") "NEON"
    npx drizzle-kit studio ---> verify changes in Drizzle Studio
        create some scripts -> package.json -> "db:push": "drizzle-kit push", db:studio": "drizzle-kit studio"\
        so we will use -> npm run db:push      {to push changes}
                       -> npm run db:studio   {to get db link}
    npm i @dicebear/core@9.2.2 @dicebear/collection@9.2.2 --legacy-peer-deps     
                        -> for generating avatars for users who don't have avatars

Better auth -> for auth (https://www.better-auth.com/)
    npm install better-auth@1.2.8 --legacy-peer-deps
    env: 
      BETTER_AUTH_SECRET=
      BETTER_AUTH_URL=
    create instance -> lib/auth.ts
     npx @better-auth/cli@1.2.8 generate

TRPC -> https://trpc.io/
    npm install @trpc/server@11.1.2 @trpc/client@11.1.2 @trpc/tanstack-react-query@11.1.2 @tanstack/react-query@5.76.1 zod@3.25.7 client-only server-only --legacy-peer-deps
    -> trpc -> client usage -> TanStack React Query (⭐️) -> server components
    is a modern TypeScript framework that lets you create fully typesafe APIs without writing an API schema like REST or GraphQL.

install Agents -> 
    npm i nanoid --legacy-peer-deps

nuqs -> 
    npm i nuqs@2.4.3 --legacy-peer-deps
  
openAi agent to connect the call ->
    npm i @stream-io/openai-realtime-api --legacy-peer-deps
  
Inngest: for summarizing meeting transcription and background jobs [even if the user logged out the background jobs will continue]
    https://app.inngest.com/env/production/apps
    npm install inngest --legacy-peer-deps
    run inngest server -> npx inngest-cli@latest dev
    inggest localhost -> http://localhost:8288
  

------------------------------------------------------------------------------------
to push / migrate cchanges to the database from schemas -> npm run db:push 
------------------------------------------------------------------------------------

configure social providers (Github - Google)
    Github -> https://github.com/settings/developers
    Google -> https://console.cloud.google.com/apis/dashboard?pli=1


------------------------------------------------------------------------------------
BASIC EXAMPLE ON RENDERING {CHILDREN}
const Card = ({ children }) => {
  return (
    <div className="p-4 border rounded">
      {children}   {/* <-- renders anything passed inside */}
    </div>
  );
};

//using it in:.
export default Card;

<Card>
  <h1>Hello</h1>
  <p>This is inside the card.</p>
</Card>

------------------------------------------------------------------------------------
why we do spreading ?

Spreading means using the ... operator in JavaScript to expand an object or array into its individual parts.
✔ Makes the code shorter
✔ Automatically includes all fields from the schema
✔ Lets you add extra fields (like userId) without rewriting everything

example:

If you have:
const input = {
  name: "Mohamed",
  email: "test@example.com",
};


Then:

{
  ...input,
  userId: "abc123"
}


Becomes:

{
  name: "Mohamed",
  email: "test@example.com",
  userId: "abc123"
}
------------------------------------------------------------------------------------
/*video streaming*/
--------------------
https://getstream.io/ 

ADD THE PUBLIC AND SECRETKEYS

INSTALL THE SDK ->  npm install @stream-io/node-sdk --legacy-peer-deps

app/lib -> create stream-video.ts
        -> npm install @stream-io/video-react-sdk --legacy-peer-deps
app/lib -> create avatar.tsx
------------------------------------------------------------------------------------
23. Connecting agents 
---------------------
1.optain openAi api key
  https://platform.openai.com/
  -> make sure you have enough balance
  -> api kays

2.head to ngrok to expose localhost so webhook handle can communicate
  -> https://dashboard.ngrok.com/
  -> follow the installation
  -> install ngrok via Homebrew with the following command: brew install ngrok
  -> Run the following command to add your authtoken to the default ngrok.yml configuration file.
    ngrok config add-authtoken 37d0ta6WH94vLGvaiKTgi1ksf0d_7rHqsAAPtxSBpBwiWeuWb
  -> Deploy your app online incmd buf tirstmake sure theat you app isrunnungthen run-> ngrok http http://localhost:3000 -> copylink
  -> get the static url for the app -> Domain -> select the domain -> start an endPoint ->copy & paste in termainal
  -> get the cmd and change the port to 3000 -> ngrok http --url=shandra-unvizarded-discomfortingly.ngrok-free.dev 3000
  -> in package.json make shortcut to run -> "dev:webhook": "ngrok http --url=shandra-unvizarded-discomfortingly.ngrok-free.dev 3000"

// so basically every time you wan to run the app run two cmds ->[ npm run dev | npm run dev:webhook ]

  3.setup stream webhook handler
    -> copy the static url -> shandra-unvizarded-discomfortingly.ngrok-free.dev
    -> go to stream dashboard -> https://dashboard.getstream.io/app/1468179/video/overview
    -> past the url in the webhooks -> Webhook & Event Configuration
      -> https://https://shandra-unvizarded-discomfortingly.ngrok-free.dev/api/webhook
    -> build the end point -> src-> app -> api -> webhook
------------------------------------------------------------------------------------
<to run>
---------
npm run dev
npm run dev:webhook
npx inngest-cli@latest dev