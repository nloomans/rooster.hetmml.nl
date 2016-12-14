const EventEmitter = require('events')

const self = new EventEmitter()

self._nodes = {
  prevButton: document.querySelectorAll('#week-selector button')[0],
  nextButton: document.querySelectorAll('#week-selector button')[1],
  currentWeekText: document.querySelector('#week-selector .current')
}

self._weekOffset = 0

// copied from http://www.meetingpointmco.nl/Roosters-AL/doc/dagroosters/untisscripts.js,
// were using the same code as they do to be sure that we always get the same
// week number.
self.getCurrentWeek = function (target) {
  const dayNr = (target.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNr + 3)
  const firstThursday = target.valueOf()
  target.setMonth(0, 1)
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7)
  }

  return 1 + Math.ceil((firstThursday - target) / 604800000)
}

self.getSelectedWeek = function () {
  const now = new Date()
  const targetDate = new Date(now.getTime() + self._weekOffset * 604800 * 1000)
  return self.getCurrentWeek(targetDate)
}

self.updateCurrentWeek = function () {
  const selectedWeekNumber = self.getSelectedWeek()
  self._nodes.currentWeekText.textContent = `Week ${selectedWeekNumber}`
  if (self.getCurrentWeek(new Date()) !== selectedWeekNumber) {
    self._nodes.currentWeekText.classList.add('changed')
  } else {
    self._nodes.currentWeekText.classList.remove('changed')
  }
  self.emit('weekChanged', selectedWeekNumber)
}

self._handlePrevButtonClick = function () {
  self._weekOffset -= 1
  self.updateCurrentWeek()
}

self._handleNextButtonClick = function () {
  self._weekOffset += 1
  self.updateCurrentWeek()
}

self._nodes.prevButton.addEventListener('click', self._handlePrevButtonClick)
self._nodes.nextButton.addEventListener('click', self._handleNextButtonClick)

module.exports = self