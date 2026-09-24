LEGISLATORS

HAS MANY:

1(CONTAINER(1 - ALL bills query))
2(CONTAINER: BILLS(2))
3(BILLS BY TOPIC)
3(RECENT BILLS)
2(CONTAINER: COMMITTEES(1))
3(COMMITTEE POSITIONS)

:BILLS
--> retrieve for current court only
--> require: topics lvl.0 & lvl.1

:: BILLS BY TOPIC
--> filter bills by sponsored/cosponsored/all
--> group bills by topic
--> order bills by top 5 topics, descending
----> for each topic: list top 3-5 most common subtopics

:: RECENT BILLS
--> retrieve last 5 sponsored bills
--> topics: show subtopics (top 2?)
--> NO STATUS

:COMMITTEES
--> retrieve for ALL GENERAL COURTS
--> use Committee/Member collections


