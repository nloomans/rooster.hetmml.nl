const fuzzy = require('fuzzy')
const getUsers = require('./getUsers')
const getURLOfUser = require('./getURLOfUser')
const removeDiacritics = require('diacritics').remove
const getWeek = require('./getWeek')

const searchNode = document.querySelector('#search')
const inputNode = searchNode.querySelector('input[type="text"]')
const autocompleteNode = document.querySelector('.autocomplete')
const scheduleIframe = document.querySelector('#schedule')
const prevButton = document.querySelectorAll('input[type="button"]')[0]
const nextButton = document.querySelectorAll('input[type="button"]')[1]
const currentWeekNode = document.querySelector('.current')

let selectedResult = -1
let results
let matches
let offset = 0

function updateWeekText () {
  if (offset === 0) currentWeekNode.innerHTML = `Week ${getWeek() + offset}`
  else currentWeekNode.innerHTML = `<strong>Week ${getWeek() + offset}</strong>`
}

getUsers().then(function (users) {
  updateWeekText()

  searchNode.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()

      if (document.querySelector('.selected')) document.querySelector('.selected').classList.remove('selected')

      const change = e.key === 'ArrowDown' ? 1 : -1
      selectedResult += change
      if (selectedResult < -1) selectedResult = matches.length - 1
      else if (selectedResult > matches.length - 1) selectedResult = -1

      if (selectedResult !== -1) autocompleteNode.children[selectedResult].classList.add('selected')
    }
  })

  searchNode.addEventListener('keyup', function (e) {
    // console.log(e)
    if (!(e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      autocompleteNode.innerHTML = ''
      if (inputNode.value.trim() === '') return

      selectedResult = -1
      results = fuzzy.filter(removeDiacritics(inputNode.value), users, {
        extract: function (el) { return removeDiacritics(el.value) }
      }).slice(0, 7)
      matches = results.map(function (el) { return users[el.index].value })

      results.forEach(function (result) {
        const resultNode = document.createElement('li')
        resultNode.innerHTML = `${result.original.value}<span class="other">${result.original.other}</span>`
        autocompleteNode.appendChild(resultNode)
      })
    }
  })

  searchNode.addEventListener('submit', submitForm)

  function submitForm (e) {
    if (results == null) return
    if (e) e.preventDefault()
    const indexInResult = selectedResult === -1 ? 0 : selectedResult
    const selectedUser = users[results[indexInResult].index]

    inputNode.value = selectedUser.value
    autocompleteNode.innerHTML = ''

    inputNode.blur()

    scheduleIframe.src = getURLOfUser(offset, selectedUser.type, selectedUser.index + 1)
  }

  autocompleteNode.addEventListener('click', function (e) {
    if (e.target.tagName === 'LI' && e.target.parentElement === autocompleteNode) {
      selectedResult = Array.prototype.indexOf.call(e.target.parentElement.childNodes, e.target)
      submitForm()
    }
  })

  prevButton.addEventListener('click', function () {
    offset--
    updateWeekText()
    submitForm()
  })

  nextButton.addEventListener('click', function () {
    offset++
    updateWeekText()
    submitForm()
  })
})

inputNode.addEventListener('click', function () {
  inputNode.select()
})

inputNode.addEventListener('blur', function () {
  inputNode.selectionStart = inputNode.selectionEnd = -1
  autocompleteNode.innerHTML = ''
})
