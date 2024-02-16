# Backend Developer Technical Assessment

## Steps to run this project:

### Locally

- Setup the environment
- Setup the project
- Notes

#### Setup the environment

This project has a devcontainer with a docker environment configured with two containers one with the postgreSQL database and another one with the Node 20 runtime. If you have docker installed on your machine and the devcontainer extension on your VSCode it will give you the option to open the project on the container and when you open it up it will configure the environment and the VSCode for you.

If you prefer to run locally you will need to install Node 20. If you are using NVM you can use the command `nvm use`.

With the environment configured you can proceed to setup the project.

#### Setup the project

1. Run `npm ci` command. If it does not work use the `npm install` command.
2. Run `npx prisma generate` command
3. Create a `.env.development` file at the root of the project and setup the environment variables. You can use the `.env.example` file to see what they are.
4. Run `npm run dev` command.

This last command will delete all previous build of the project and then build it again and start the main lambda offline. This will simulate a AWS Api Gateway and a Lambda execution when you make a request to `localhost:4000/`. So if you want to make the `GET /companies` you can make a GET request to `localhost:4000/companies`.

#### Notes

The `PUT /job/:job_id/publish` endpoint uses a SQS Queue and the queue will start another lambda. So to better see this endpoint in action it is advised to deploy this project to AWS to test it fully. 

The body of the `POST /job` is like this
```
{
  title: string,
  description: string,
  location: string,
  notes?: string, 
  companyId: string
}
```

The body of the `PUT /job` is like this
```
{
  title?: string,
  description?: string,
  location?: string,
  notes?: string, 
  companyId?: string
}
```

### Remotely

I've deployed this project to my personal AWS account as well to test and I will leave it online for some time. So it is possible to make requests to it online as well. To do that you can use this endpoint `https://2m9bqd3oo3.execute-api.us-east-1.amazonaws.com/` as an entry point. So if you want to make the `GET /companies` you can make a GET request to `https://2m9bqd3oo3.execute-api.us-east-1.amazonaws.com/companies`.

I will not share the connection string to the database so I have done the following endpoint that is not part of the challenge just to bring everything on the `jobs` table. Just make a GET request to `https://2m9bqd3oo3.execute-api.us-east-1.amazonaws.com/job`. This way is possible to see the rejected jobs as well as the notes from the OpenAI Moderation API.

## Bonus Questions

1. Discuss scalability solutions for the job moderation feature under high load conditions. Consider that over time the system usage grows significantly, to the point where we will have thousands of jobs published every hour. Consider the API will be able to handle the requests, but the serverless component will be overwhelmed with requests to moderate the jobs. This will affect the database connections and calls to the OpenAI API. How would you handle those issues and what solutions would you implement to mitigate the issues?
<br>
The moderation lambda is invoked by a SQS queue. So to deal with this scenario I would fine tune the queue. The queue could be updated to be a FIFO queue. This by itself would have [content-based deduplication](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues-exactly-once-processing.html). I would also find the best batch size. With this one lambda can deal with a lot of requests and they would share the same connection pool. The handler was programmed to execute asynchronously every message of the batch. This way the handler code does not need to be touched. The amount of concurrent handlers also need to be taken into consideration. With these fine tunning the system will be a lot more resilient.
<br>

2. Propose a strategy for delivering the job feed globally with sub-millisecond latency. Consider now that we need to provide a low latency endpoint that can serve the job feed content worldwide. Using AWS as a cloud provider, what technologies would you need to use to implement this feature and how would you do it?
<br>
If the normal S3 is not fast enough I would first try to make a [Multi-Region Access Points in Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/MultiRegionAccessPoints.html). With this the content would be replicated across the globe and stored in datacenters near the client who made the request. If this is still not enough maybe this is an [Edge](https://aws.amazon.com/pt/edge/services/) case (haha pun intended). This edge services of AWS like [AWS Storage Gateway](https://aws.amazon.com/pt/storagegateway/) or [AWS CloudFront](https://aws.amazon.com/pt/cloudfront/) may be what is needed to resolve this sub-millisecond latency problem to delivery the feed globally.
<br>


## Notes

> If you have any doubt you can send me an email: thiagoluigi7@hotmail.com

### Extra endpoints

I have implemented two endpoints that are not part of the challenge:

- `GET /job`
- `POST /feed`

#### `GET /job`

I have done it to show the database entries in case you want to check the solution that I have already deployed to my AWS Account. So with this endpoint is possible to have all the entries on the jobs table. Because a connection string to the database will not be provided.

#### `POST /feed`

This one I have done to invoke the lambda function that updates the feed.json file on the S3 bucket. It is simply for debugging purposes because I did not want to wait for the timely invocations. It can also be used to update the feed.json on demand.

### DDL

The `notes` column of the `jobs` table would be better if it was a `JSONB` column instead of just text. With a JSONB column it would be possible to better store the return of the OpenAI API. And it would be better to query it as well.

### Running the express application

This project was designed with its execution happening on a lambda. So it is not possible to start just the express application and make request directly to it without simulating a lambda + gateway. 

----

## Welcome!

We're excited to have you participate in our Backend Developer technical assessment. This test is designed to gauge your expertise in backend development, with a focus on architectural and organizational skills. Below, you'll find comprehensive instructions to set up and complete the project. Remember, completing every step is not mandatory; some are optional but can enhance your application.

## Assessment Overview

Your task is to develop a NodeJS API for a job posting management application. Analyze the application details and use cases, and translate them into functional endpoints.

### Application Components

Your solution should incorporate the following components and libraries:

1. **Relational Database**: Utilize a SQL database (PostgreSQL 16) with two tables (`companies` and `jobs`). The DDL script in the `ddl` folder of this repository initializes these tables. The `companies` table is pre-populated with fictitious records, which you should not modify. Focus on managing records in the `jobs` table. You don't need to worry about setting up the database, consider the database is already running in the cloud. Your code only needs to handle database connections. To test your solution, use your own database running locally or in the server of your choice.

2. **REST API**: Develop using NodeJS (version 20) and ExpressJS. This API will manage the use cases described below.

3. **Serverless Environment**: Implement asynchronous, event-driven logic using AWS Lambda and AWS SQS for queue management.

4. **Job Feed Repository**: Integrate a job feed with AWS S3. This feed should periodically update a JSON file reflecting the latest job postings.

### User Actions

Convert the following use cases into API endpoints:

- `GET /companies`: List existing companies.
- `GET /companies/:company_id`: Fetch a specific company by ID.
- `POST /job`: Create a job posting draft.
- `PUT /job/:job_id/publish`: Publish a job posting draft.
- `PUT /job/:job_id`: Edit a job posting draft (title, location, description).
- `DELETE /job/:job_id`: Delete a job posting draft.
- `PUT /job/:job_id/archive`: Archive an active job posting.

### Integration Features

- Implement a `GET /feed` endpoint to serve a job feed in JSON format, containing published jobs (column `status = 'published'`). Use a caching mechanism to handle high traffic, fetching data from an S3 file updated periodically by an AWS Lambda function. The feed should return the job ID, title, description, company name and the date when the job was created. This endpoint should not query the database, the content must be fetched from S3.
- This endpoint receives a massive number of requests every minute, so the strategy here is to implement a simple cache mechanism that will fetch a previously stored JSON file containing the published jobs and serve the content in the API. You need to implement a serverless component using AWS Lambda, that will periodically query the published jobs and store the content on S3. The `GET /feed` endpoint should fetch the S3 file and serve the content. You don't need to worry about implementing the schedule, assume it is already created using AWS EventBridge. You only need to create the Lambda component, using NodeJS 20 as a runtime.

### Extra Feature (Optional)

- **Job Moderation**: using artificial intelligence, we need to moderate the job content before allowing it to be published, to check for potential harmful content.
Every time a user requests a job publication (`PUT /job/:job_id/publish`), the API should reply with success to the user, but the job should not be immediately published. It should be queued using AWS SQS, feeding the job to a Lambda component.
Using OpenAI's free moderation API, create a Lambda component that will evaluate the job title and description, and test for hamrful content. If the content passes the evaluation, the component should change the job status to `published`, otherwise change to `rejected` and add the response from OpenAI API to the `notes` column.

### Bonus Questions

1. Discuss scalability solutions for the job moderation feature under high load conditions. Consider that over time the system usage grows significantly, to the point where we will have thousands of jobs published every hour. Consider the API will be able to handle the requests, but the serverless component will be overwhelmed with requests to moderate the jobs. This will affect the database connections and calls to the OpenAI API. How would you handle those issues and what solutions would you implement to mitigate the issues?
2. Propose a strategy for delivering the job feed globally with sub-millisecond latency. Consider now that we need to provide a low latency endpoint that can serve the job feed content worldwide. Using AWS as a cloud provider, what technologies would you need to use to implement this feature and how would you do it?

## Instructions

1. Fork this repository and create a branch named after yourself.
2. Develop the solution in your branch.
3. Use your AWS account or other environment of your choice to test and validate your solution.
4. Update the README with setup and execution instructions.
5. Complete your test by sending a message through the Plooral platform with your repository link and branch name.

## Evaluation Criteria

We will assess:

- Knowledge of JavaScript, Node.js, Express.js.
- Proficiency with serverless components (Lambda, SQS).
- Application structure and layering.
- Effective use of environment variables.
- Implementation of unit tests, logging, and error handling.
- Documentation quality and code readability.
- Commit history and overall code organization.

Good luck, and we're looking forward to seeing your innovative solutions!
Implementation of the user actions and integration features is considered mandatory for the assessment. The extra feature and the bonus questions are optional, but we encourage you to complete them as well, it will give you an additional edge over other candidates.

## A Note on the Use of AI Tools

In today's evolving tech landscape, AI tools such as ChatGPT and GitHub Copilot have become valuable resources for developers. We recognize the potential of these tools in aiding problem-solving and coding. While we do not prohibit the use of AI in this assessment, we encourage you to primarily showcase your own creativity and problem-solving skills. Your ability to think critically and design solutions is what we're most interested in.

That said, if you do choose to utilize AI tools, we would appreciate it if you could share details about this in your submission. Include the prompts you used, how you interacted with the AI, and how it influenced your development process. This will give us additional insight into your approach to leveraging such technologies effectively.

Remember, this assessment is not just about getting to the solution, but also about demonstrating your skills, creativity, and how you navigate and integrate the use of emerging technologies in your work.
