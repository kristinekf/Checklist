<script>
import Cvitem from './Cvitem.svelte';

const edu = [
  'Specialization in database- and search systems',
  "AI/NLP master's",
  'Reference groups: ',
  '- Web development',
  '- Software development',
  '- Programming Lab 2',
  '- Java',
  '- Electronics system design and analysis 1'
]
const work_samf = ['Development of samfundet.no', 'Ruby on rails']
const work_xcom = ['Managing business relations and meetings for the annual trip to Tokyo for Computer Science students']
const work_revolve = ['Developing analysis tools for an electric race car', 'CANBUS protocol', 'Python desktop UI with Qt']
const work_omega = ['Database work for omega.ntnu.no', 'PHP, MySQL']

const work_mito_summer = ['Location: Trondheim', 'Scala backend', 'GraphQL tooling', 'React + TS']
const work_mito = ['Location: Trondheim', 'Part-time fullstack']
const work_ci_part = ['Location: Trondheim', 'Part-time vue.js developer', 'Remote job']
const work_ci = ['Location: Oslo', 'Vue.js, PHP']
const work_skagen = ['Location: Stavanger', 'OpenCV/Tensorflow, sentiment analysis']

</script>

<div class='main-content'>
  <div class='cv-container'>
    <h1>education</h1>
    <Cvitem year='2015-present' title="Computer Science, NTNU" items={edu} />
  </div>
  <div class='cv-container'>
    <h1>voluntary/uni</h1>
    <Cvitem year='2017-present' title='Web developer, Studentersamfundet i Trondheim' items={work_samf} />
    <Cvitem year='2017-2017' title='Business manager, XCOM 18' items={work_xcom} />
    <Cvitem year='2015-2016' title='Software developer, Revolve NTNU' items={work_revolve} />
    <Cvitem year='2014-2015' title='Systems developer, Omega linjeforening' items={work_omega} />
  </div>
  <div class='cv-container'>
    <h1>work experience</h1>
    <Cvitem year='Aug 2019 - present' title='Part-time software developer, Mito.ai' items={work_mito} />
    <Cvitem year='June 2019 - Aug 2019' title='Summer internship, Mito.ai' items={work_mito_summer} />
    <Cvitem year='Aug 2018 - Mar 2019' title='Part-time software developer, Cloud Insurance' items={work_ci_part} />
    <Cvitem year='June 2018 - Aug 2018' title='Summer internship, Cloud Insurance' items={work_ci} />
    <Cvitem year='June 2017 - July 2017' title='Summer internship, Skagen Fondene' items={work_skagen} />
  </div>
</div>
