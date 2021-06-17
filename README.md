# Tracking Dream SMP's Twitch Viewership Movements

## MIT 6.859 Spring 2021

#### Team Members
Sabina Chen

#### Project Abstract
We present Tracking Dream SMP’s Twitch Viewership Movements, an interactive visualization to explore underlying viewership movement information between Twitch streamers within the Dream SMP community. Using real-time data gathered from the Twitch API, viewership movement can be mapped between streamers across different points in time. Our visualization uses animations to encode movement direction and viewership values. It also features a Minecraft-themed pixelated game design to encourage users to engage with the visualization. We show that our visualization enables users to take an exploratory approach to viewing real-world viewership data and be able to find basic trends in streamer interactions within the community.      

#### Project Deliverables
[[Paper](https://github.com/6859-sp21/final-project-twitch-viewership/blob/main/final/FinalPaper.pdf)] [[Video](https://youtu.be/osMohpJdRC4)] [[Slides](https://docs.google.com/presentation/d/1zp68DklkSthziaxZCDfeolvj4qnK2LjT8tHXMNJp5y8/edit?usp=sharing)]

#### Visualization URL
https://6859-sp21.github.io/final-project-twitch-viewership/

#### Example Screenshot
![primary-display.png](https://github.com/6859-sp21/final-project-twitch-viewership/blob/main/docs/primary-display.png)

-----------------------------

### Overview

#### Dataset Credits
- [Twitch API](https://dev.twitch.tv/docs/api/) - For retrieving viewership data
- [Minecraft Wiki](https://minecraft.fandom.com/wiki/Minecraft_Wiki) - For minecraft textures/assets
- [Dream SMP Wiki](https://dreamteam.fandom.com/wiki/Dream_SMP) - For dream smp membership information and character skins

#### Inspired By
- [Visualizing Twitch Communities](https://github.com/KiranGershenfeld/VisualizingTwitchCommunities/tree/CloudCompute) - For the initial idea of tracking twitch viewership interactions between communities
- [Dream SMP Relationship Chart](https://www.reddit.com/r/dreamsmp/comments/k6mng7/the_dream_smp_relationship_chart/) - For the idea to focus specifically on the relationships within the Dream SMP community and to replace the nodes with the associated minecraft skins
- [Animated Sankey Links](http://bl.ocks.org/nitaku/1adb4033d7078f7d005e) - For the base template that I built my code off of

#### Super Cool Ideas for Visualizing Movement
- [A Day in the Life of Americans](https://flowingdata.com/2015/12/15/a-day-in-the-life-of-americans/)
- [Income Mobility Charts](https://www.nytimes.com/interactive/2018/03/27/upshot/make-your-own-mobility-animation.html)

## Quick Start

#### To Clone Repo
- ```git clone https://github.com/6859-sp21/final-project-twitch-viewership.git```

#### To Run
- ```npm ci```
- Open ```index.html```

#### Data Retrieval Notes
- This visualization works with all the code and data available in the ```main``` branch of this repo.
- This visualization only shows data available between the dates May 01, 2021 to May 19, 2021. 
- Because viewership data is required to be retrieved and updated in real-time, I will not be further updating the data for this GitHub repo past May 19, 2021. 
- To retrieve real-time data yourself, please refer to the API Section of Dev Notes below. 

## Advanced Dev Notes

### Files

#### api/
- ```cron/``` - cron schedulers and logs for requesting/processing data
- ```utils/``` - helper functions for requesting data via the Twitch API

#### assets/
- ```dreamsmp-skins/``` - face and fullbody skins of the dream smp minecraft characters
	* Character Skins from: https://dreamteam.fandom.com/wiki/Dream_SMP
- ```minecraft-textures/``` - various minecraft textures used for UI
	* Minecraft Textures from: https://minecraft.fandom.com/wiki/Minecraft_Wiki
- ```minecraft-steve/``` - face and fullbody skin of minecraft's main protagonist, Minecraft Steve
	* Minecraft Steve Skin from: https://minecraft.fandom.com/wiki/Minecraft_Wiki

#### css/
- ```style.css``` - frontend styling for the visualization

#### data/
- ```graph/``` - processed ```.json``` files used directly by D3 node graphs (requires nodes and links for each datetime)
- ```raw/``` - unprocessed responses saved directly from Twitch API requests
- ```dreamsmp-twitch.csv``` - current list of active dream smp members (ordered by join date, from earliest to latest joined)

#### scripts/
- various frontend scripts using the D3 library

### API

#### Cron Scheduler

Setup
- ```cd api``` 
- ```npm ci```

Scheduled for every hour at 15 minutes 
- ```crontab``` calls ```node cronjob.js```, which calls ```pingTwitch.js```, which starts the "Processing Data" section below in order
- ```crontab``` calls ```node cronjob_stats.js timeStats```, which calls ```processStats.js```

Scheduled at the end of every day
- ```crontab``` calls ```node cronjob_stats.js dateStats```, which calls one of ```processStats.js```
- ```crontab``` calls ```node cronjob_stats.js allStats```, which calls one of ```processStats.js```

#### Processing Data (Order of Operations)
1. (manual) Make sure ```dreamsmp-twitch.csv``` is up-to-date
2. ```csvToJson.js``` - converts and saves ```dreamsmp-twitch.csv``` into ```nodes.json```
3. ```getLiveStreamers.js``` - reads ```nodes.json``` and returns only live streamer list
4. ```getChatters.js``` - get active chatters of specified live streamer, and saves to appropriate datetime folder in the ```data/``` directory
5. ```processGraphData.js``` - converts raw data into appropriate nodes and links ```.json``` files to be used by the D3 library
6. (for fun) ```getTeam.js``` - get streamers listed under the "Dream SMP" team

#### Processing Stats
- Notable functions in ```processStats.js```
    * ```saveTimeStats``` - get stats for a specific TIME
    * ```saveDateStats``` - get stats for a specific DATE
    * ```saveAllStats``` - update stats of all-time

### Miscellaneous

#### To Pull Upstream Fork:
```
git remote add upstream https://github.com/6859-sp21/final-project-twitch-viewership.git
git fetch upstream
git rebase upstream/main
git push --force
```

#### Tools Used:
- [JSON Formatter](https://jsonformatter.curiousconcept.com/)
- [Image Color Picker](https://imagecolorpicker.com/en)

### Notes to Self:
- The cron scheduler is NOT scheduled on the hour (and is instead scheduled on minute 15) because many streamers start on the hour, and it takes a while for viewer counts to get appropriately updated via the API (it usually takes 15-30min to update), which causes the viewer counts extracted to be lower than they actually are, which is why I chose to extract data on minute 15, as opposed to minute 0.
- For code consistency:
    - put parenthesis ```()``` around function parameters 
    	- ie. ```const func = (parameterName) => {do-something-here};```
    - interpolate variables into strings 
    	- ie. ```'${variable}-helloworld'``` instead of ```variable+'helloworld'```
    - folder names do NOT end with ```/```, the ```/```s will need to be reinserted during pathname creation 
    	- ie. ```dataFolder = 'outerFolder/innerFolder```
    	- ie. ```${dataFolder}/filename.json```
- Useful commands:
    - ```crontab -l``` - view current cron jobs lined up 
    - ```crontab -e``` - edit cron jobs
        - Every hour:
            * ```15 * * * * /usr/local/bin/node /absolutePath/api/cron/cronjob.js >> /absolutePath/api/cron/logs/cronjob_stdout.log 2>> /absolutePath/api/cron/logs/cronjob_stderr.log```
            * ```16 * * * * /usr/local/bin/node /absolutePath/api/cron/cronjob_stats.js timeStats >> /absolutePath/api/cron/logs/cronjob_stats_stdout.log 2>> /absolutePath/api/cron/logs/cronjob_stats_stderr.log```
        - End of day:
            * ```17 23 * * * /usr/local/bin/node /absolutePath/api/cron/cronjob_stats.js dateStats >> /absolutePath/api/cron/logs/cronjob_stats_stdout.log 2>> /absolutePath/api/cron/logs/cronjob_stats_stderr.log```
            * ```18 23 * * * /usr/local/bin/node /absolutePath/api/cron/cronjob_stats.js allStats >> /absolutePath/api/cron/logs/cronjob_stats_stdout.log 2>> /absolutePath/api/cron/logs/cronjob_stats_stderr.log```
    - ```>``` - overwrite
    - ```>>``` - append


-----------------------------

## Project Commentary

This project was done individually (by Sabina Chen). All design, code, and written materials for this project were developed by myself. 

The project process involved a lot of initial brainstorming and data collection. Because I knew initially that I wanted to do a project on visualizing Twitch viewership movements, the biggest hurdle was figuring out how to do so without repeating the work of [Visualizing Twitch Communities](https://github.com/KiranGershenfeld/VisualizingTwitchCommunities/tree/CloudCompute). I spent a lot of time trying to figure out how to make this visualization “unique”. The biggest advice I got was to focus the visualization on a specific community within the Twitch landscape. Since I’ve been watching a lot of Minecraft streamers recently, focusing on the Dream SMP Minecraft community became the obvious choice. 

However, the decision to focus only on visualizing the Dream SMP Minecraft community lead to another issue: I have never played Minecraft before. Thus, another bulk of my time was spent creating visualization mockups, and confirming/user testing design decisions and game controls with my peers, since I was very anxious about accidentally misrepresenting information about the game. 

Another large part of the project development process, which probably took up 50-60% of my actual coding time, was the data collection and preprocessing portion. Given that I was using real-time data via the Twitch API, I needed to learn how to: (1) retrieve data from the API, (2) preprocess it reliably, and (3) setup background schedulers. The majority of this time was honestly spent bug-fixing a bunch of random edge cases and failure points and re-cleaning the previously processed data. 

Interestingly enough, given the experiences I gained from the A4 assignment (which I also chose to do individually), compared to A4 where I spent the bulk of my time learning how to use D3 and working around my spaghetti code to get all the features working, for the final project, I actually spent the least amount of time on feature implementation and more time on overall stylistic design. The two biggest lessons I learned from A4 were: (1) keep your code clean, and (2) more graphs/features != better visualization. 

For the final project, I was extremely aware of how I was modularizing my code, which made it a lot easier to work with down the line. Also, because I spent such a large amount of time in the beginning brainstorming design and functionality, I was able to plan my code structure appropriately (compared to A4 where I was tacking on new features on the spot). The better planning and cleaner code made it easier and faster to implement the features that I wanted, thereby enabling me to focus more on overall user experience and stylistic design for the final visualization. 

Overall, this was an incredibly fun project to work on, and I am super proud and happy with the results. Hopefully users also find it interesting to interact with and explore. I definitely had a great time making it! 

Here is a bonus screenshot of one of my sketches while I was initially brainstorming designs for this visualization:
![sketch.png](https://github.com/6859-sp21/final-project-twitch-viewership/blob/main/docs/sketch.png)
