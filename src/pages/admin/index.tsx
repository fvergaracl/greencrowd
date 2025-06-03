import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTranslation } from "@/hooks/useTranslation"
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb"
import DefaultLayout from "@/components/AdminLayout"
import {
  faClipboardList,
  faCircle,
  faUser,
  faMapMarkerAlt,
  faTasks,
  faFlag
} from "@fortawesome/free-solid-svg-icons"

export default function Admin() {
  const { t } = useTranslation()
  return (
    <DefaultLayout>
      <Breadcrumb pageName={t("System Overview")} breadcrumbPath='Home' />
      <div className='min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'>
        <div className='container mx-auto py-12 px-6'>
          <p className='text-lg text-center mb-12'>
            {t(
              "Explore how entities like Campaigns, Areas, POIs, Tasks, and Users are interrelated within the system. Campaigns have multiple Areas, Areas contain multiple POIs, and each POI can have multiple Tasks"
            )}
          </p>

          {/* Graph Representation */}
          <div className='flex justify-center mb-16'>
            <div className='bg-white dark:bg-gray-800 shadow-lg p-8 rounded-lg'>
              <h2
                className='text-2xl font-semibold text-center mb-6'
                data-cy='system-overview-title'
              >
                {t("Entity Relationships")}
              </h2>
              <div
                className='flex justify-center'
                data-cy='system-overview-graph'
              >
                <svg viewBox='0 0 900 700' className='w-full h-[40rem]'>
                  {/* Connections: Campaign */}
                  <line
                    x1='450'
                    y1='90'
                    x2='250'
                    y2='160'
                    className='stroke-blue-300 stroke-2'
                  />
                  <line
                    x1='450'
                    y1='90'
                    x2='450'
                    y2='160'
                    className='stroke-blue-300 stroke-2'
                  />
                  <line
                    x1='450'
                    y1='90'
                    x2='650'
                    y2='160'
                    className='stroke-blue-300 stroke-2'
                  />

                  {/* Connections: Areas to POIs */}
                  <line
                    x1='250'
                    y1='240'
                    x2='200'
                    y2='310'
                    className='stroke-green-300 stroke-2'
                  />
                  <line
                    x1='250'
                    y1='240'
                    x2='300'
                    y2='310'
                    className='stroke-green-300 stroke-2'
                  />
                  <line
                    x1='650'
                    y1='240'
                    x2='600'
                    y2='310'
                    className='stroke-green-300 stroke-2'
                  />
                  <line
                    x1='650'
                    y1='240'
                    x2='700'
                    y2='310'
                    className='stroke-green-300 stroke-2'
                  />

                  {/* Connections: Areas to OpenTasks */}
                  <line
                    x1='250'
                    y1='200'
                    x2='170'
                    y2='200'
                    className='stroke-indigo-300 stroke-2'
                  />
                  <line
                    x1='650'
                    y1='200'
                    x2='730'
                    y2='200'
                    className='stroke-indigo-300 stroke-2'
                  />

                  {/* Connections: POIs to Tasks */}
                  <line
                    x1='200'
                    y1='390'
                    x2='200'
                    y2='460'
                    className='stroke-yellow-300 stroke-2'
                  />
                  <line
                    x1='300'
                    y1='390'
                    x2='300'
                    y2='460'
                    className='stroke-yellow-300 stroke-2'
                  />
                  <line
                    x1='600'
                    y1='390'
                    x2='600'
                    y2='460'
                    className='stroke-yellow-300 stroke-2'
                  />
                  <line
                    x1='700'
                    y1='390'
                    x2='700'
                    y2='460'
                    className='stroke-yellow-300 stroke-2'
                  />

                  {/* Campaign */}
                  <circle cx='450' cy='50' r='40' className='fill-blue-500' />
                  <text
                    x='450'
                    y='55'
                    textAnchor='middle'
                    fill='white'
                    fontSize='16'
                  >
                    {t("Campaign")}
                  </text>

                  {/* Areas */}
                  <circle cx='250' cy='200' r='40' className='fill-green-500' />
                  <text
                    x='250'
                    y='205'
                    textAnchor='middle'
                    fill='white'
                    fontSize='16'
                  >
                    {t("Area")} 1
                  </text>

                  <circle cx='650' cy='200' r='40' className='fill-green-500' />
                  <text
                    x='650'
                    y='205'
                    textAnchor='middle'
                    fill='white'
                    fontSize='16'
                  >
                    {t("Area")} N
                  </text>

                  {/* Questionnaire */}
                  <circle cx='450' cy='200' r='40' className='fill-cyan-500' />
                  <text
                    x='450'
                    y='205'
                    textAnchor='middle'
                    fill='white'
                    fontSize='14'
                  >
                    {t("Questionnaire")}
                  </text>

                  {/* OpenTasks (moved laterally) */}
                  <circle
                    cx='130'
                    cy='200'
                    r='40'
                    className='fill-indigo-500'
                  />
                  <text
                    x='130'
                    y='205'
                    textAnchor='middle'
                    fill='white'
                    fontSize='13'
                  >
                    {t("OpenTask")}
                  </text>

                  <circle
                    cx='770'
                    cy='200'
                    r='40'
                    className='fill-indigo-500'
                  />
                  <text
                    x='770'
                    y='205'
                    textAnchor='middle'
                    fill='white'
                    fontSize='13'
                  >
                    {t("OpenTask")}
                  </text>

                  {/* POIs */}
                  <circle
                    cx='200'
                    cy='350'
                    r='40'
                    className='fill-yellow-500'
                  />
                  <text
                    x='200'
                    y='355'
                    textAnchor='middle'
                    fill='white'
                    fontSize='14'
                  >
                    POI 1
                  </text>

                  <circle
                    cx='300'
                    cy='350'
                    r='40'
                    className='fill-yellow-500'
                  />
                  <text
                    x='300'
                    y='355'
                    textAnchor='middle'
                    fill='white'
                    fontSize='14'
                  >
                    POI M
                  </text>

                  <circle
                    cx='600'
                    cy='350'
                    r='40'
                    className='fill-yellow-500'
                  />
                  <text
                    x='600'
                    y='355'
                    textAnchor='middle'
                    fill='white'
                    fontSize='14'
                  >
                    POI 1
                  </text>

                  <circle
                    cx='700'
                    cy='350'
                    r='40'
                    className='fill-yellow-500'
                  />
                  <text
                    x='700'
                    y='355'
                    textAnchor='middle'
                    fill='white'
                    fontSize='14'
                  >
                    POI L
                  </text>

                  {/* Tasks */}
                  <circle cx='200' cy='500' r='40' className='fill-red-500' />
                  <text
                    x='200'
                    y='505'
                    textAnchor='middle'
                    fill='white'
                    fontSize='14'
                  >
                    {t("Task")} 1
                  </text>

                  <circle cx='300' cy='500' r='40' className='fill-red-500' />
                  <text
                    x='300'
                    y='505'
                    textAnchor='middle'
                    fill='white'
                    fontSize='14'
                  >
                    {t("Task")} 2
                  </text>

                  <circle cx='600' cy='500' r='40' className='fill-red-500' />
                  <text
                    x='600'
                    y='505'
                    textAnchor='middle'
                    fill='white'
                    fontSize='14'
                  >
                    {t("Task")} 1
                  </text>

                  <circle cx='700' cy='500' r='40' className='fill-red-500' />
                  <text
                    x='700'
                    y='505'
                    textAnchor='middle'
                    fill='white'
                    fontSize='14'
                  >
                    {t("Task")} P
                  </text>
                </svg>
              </div>
            </div>
          </div>

          <div className='space-y-12' data-cy='system-overview-description'>
            <div className='flex items-center gap-6'>
              <FontAwesomeIcon
                icon={faFlag}
                className='text-blue-500 text-3xl'
              />
              <div>
                <h3 className='text-2xl font-semibold'>{t("Campaigns")}</h3>
                <p>
                  {t(
                    "Campaigns represent overarching projects. Each campaign can contain one or many areas to organize tasks geographically"
                  )}
                  .
                </p>
              </div>
            </div>

            {/* Questionnaires */}
            <div className='flex items-center gap-6'>
              <FontAwesomeIcon
                icon={faClipboardList}
                className='text-cyan-500 text-3xl'
              />
              <div>
                <h3 className='text-2xl font-semibold'>
                  {t("Questionnaires")}
                </h3>
                <p>
                  {t(
                    "Questionnaires are structured sets of questions associated directly with a campaign. They can be displayed conditionally - before, after, daily, or every X days - and are used to collect repeated or contextual user responses throughout the campaign lifecycle"
                  )}
                  .
                </p>
              </div>
            </div>

            {/* Open Tasks */}
            <div className='flex items-center gap-6'>
              <FontAwesomeIcon
                icon={faTasks}
                className='text-indigo-500 text-3xl'
              />
              <div>
                <h3 className='text-2xl font-semibold'>{t("Open Tasks")}</h3>
                <p>
                  {t(
                    "Open Tasks are flexible tasks assigned directly to areas, independent of specific points of interest. They are ideal for general actions like submitting observations or answering surveys within a defined geographic radius and time window"
                  )}
                  .
                </p>
              </div>
            </div>

            {/* Areas */}
            <div className='flex items-center gap-6'>
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className='text-green-500 text-3xl'
              />
              <div>
                <h3 className='text-2xl font-semibold'>{t("Areas")}</h3>
                <p>
                  {t(
                    "Areas define specific regions within a campaign. Each area can include one or more Points of Interest (POIs)"
                  )}
                  .
                </p>
              </div>
            </div>

            {/* POIs */}
            <div className='flex items-center gap-6'>
              <FontAwesomeIcon
                icon={faCircle}
                className='text-yellow-500 text-3xl'
              />
              <div>
                <h3 className='text-2xl font-semibold'>
                  {t("Points of Interest (POIs)")}
                </h3>
                <p>
                  {t(
                    "POIs are precise locations within an area where specific tasks can be assigned. Each POI can contain multiple tasks"
                  )}
                  .
                </p>
              </div>
            </div>

            {/* Tasks */}
            <div className='flex items-center gap-6'>
              <FontAwesomeIcon
                icon={faTasks}
                className='text-red-500 text-3xl'
              />
              <div>
                <h3 className='text-2xl font-semibold'>{t("Tasks")}</h3>
                <p>
                  {t(
                    "Tasks define the actions to be completed at a POI, such as filling surveys or performing specific actions"
                  )}
                  .
                </p>
              </div>
            </div>

            {/* Users */}
            <div className='flex items-center gap-6'>
              <FontAwesomeIcon
                icon={faUser}
                className='text-purple-500 text-3xl'
              />
              <div>
                <h3 className='text-2xl font-semibold'>{t("Users")}</h3>
                <p>
                  {t(
                    "Users interact with the system by completing tasks and contributing data. They can also manage campaigns if granted permission"
                  )}
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}
