const add_btn = document.getElementById('add_btn');
const notes_list = document.getElementById('notes_list');
const remove_btn = document.getElementById('remove_btn');
const note_text = document.getElementById('note_text');
const time_display = document.getElementById('time_display');

function Note(content = '') {
    if(content === ''){
        this._content = '';
        this._title = 'Title';
    }
    else {
        this._content = content
        if(content.length() > 20) {
            this._title = content.split('\n')[0].slice(0, 20);
        }
        else {
            this._title = content;
        }
    }
    this._id = Date.now()
    this._date = null
    this._selected = false
}


Note.prototype.setDate = function(date) {
    this._date = date
}

Note.prototype.getDate = function() {
    return this._date
} 

Note.prototype.setSelected = function(selected) {
    this._selected = selected
}

Note.prototype.getSelected = function() {
    return this._selected
}

Note.prototype.getContent = function() {
    return this._content
}

Note.prototype.getTitle = function() {
    return this._title
}

Note.prototype.getId = function() {
    return this._id
}

Note.prototype.setContent = function(content) {
    if(content === ''){
        this._title = 'Title';
    }
    else {
        this._content = content
        if(content.length > 20) {
            this._title = content.split('\n')[0].slice(0, 20);
        }
        else {
            this._title = content;
        }
    }
}

const create_date = (d) => {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var day = days[d.getDay()];
    var hr = d.getHours();
    var min = d.getMinutes();
    var sec = d.getSeconds();
    if (sec < 10) {
        sec = "0" + sec;
    }
    if (min < 10) {
        min = "0" + min;
    }
    var ampm = "am";
    if( hr > 12 ) {
        hr -= 12;
        ampm = "pm";
    }
    var date = d.getDate();
    var month = months[d.getMonth()];
    var year = d.getFullYear();
    let curent_date = day + " " + hr + ":" + min + ":" + sec + " " + ampm + " " + date + " " + month + " " + year;
    return curent_date
}

const createNote = () => {
    let note = new Note();
    note.setDate(create_date(new Date()));
    return note
}

const all_notes = []

const add_note = (type, data) => {
    if(type === 'add') {
        let new_note = createNote()
        all_notes.forEach(note => {
            note.setSelected(false);
        })
        all_notes.push(new_note);
        return {
            notes : all_notes
        } 
    }else if(type === 'get') {
        return {
            notes : all_notes
        }
    }
}

function renderTime(time) {
    time_display.innerHTML = time;
}

function renderNotes(param) {
    let notes = add_note(param, null).notes;
    notes_list.innerHTML = '';
    notes.forEach(note => {
        let noteLi = document.createElement('li');
        noteLi.dataset['id'] = note.getId();
        noteLi.setAttribute('id', note.getId());
        noteLi.appendChild(document.createTextNode(note.getTitle()));
        notes_list.insertBefore(noteLi, notes_list.firstChild);
        if (note.getSelected()){
            noteLi.setAttribute('class', 'active');
        }else {
            noteLi.setAttribute('class', '');
        }
    })
    localStorage.setItem('notes', JSON.stringify(all_notes));

}

window.onload = () => {
    if (localStorage.getItem('notes') !== null) {
        let notes = JSON.parse(localStorage.getItem('notes'));
        notes.forEach(note => {
            note.__proto__ = Note.prototype
        })
        all_notes.splice(0, notes.length, ...notes);
    }
    renderNotes('get');
    let url = window.location.hash;
    let id = url.substring(url.indexOf('_')+1, url.length);
    all_notes.forEach(note => {
        let noteLi = document.getElementById(note.getId());
        if (note.getId() == id){
            noteLi.setAttribute('class', 'active');
            note.setSelected(true);
            renderTime(note.getDate()); 

            note_text.value = note.getContent();
        }else {
            noteLi.setAttribute('class', '');
            note.setSelected(false);
        }
    })
}

const create_url = (title, id) => {
    let url = 'id=' + title + '_'+ id;
    return url
}

window.onhashchange = () =>{
    let url = window.location.hash;
    if(url.length < 1) {
        all_notes.forEach(note => {
            note.setSelected(false);
            let noteLi = document.getElementById(note.getId());
            noteLi.setAttribute('class', '');
        })
        note_text.value = '';
        renderTime('');
    }else {
        let id = url.substring(url.indexOf('_')+1, url.length);
        all_notes.forEach(note => {
            let noteLi = document.getElementById(note.getId());
            if (note.getId() == id){
                noteLi.setAttribute('class', 'active');
                note_text.value = note.getContent();
                note.setSelected(true);
                renderTime(note.getDate());     
            }else {
                note.setSelected(false);
                noteLi.setAttribute('class', '');
            }
        })
    }
}



window.onclick = (event) => {
    const elem = event.target
    if (elem.tagName === 'LI') {
        const notes_l = [...add_note('get', null).notes];
        const id = elem.dataset['id']
        for (let i = 0; i < notes_l.length; i++){
            all_notes[i].setSelected(false);
            if (notes_l[i].getId() == id) {
                window.location.hash = create_url(notes_l[i].getTitle(), notes_l[i].getId())
                note_text.value = notes_l[i].getContent();
                notes_l[i].setSelected(true);
            }else {
                notes_l[i].setSelected(false);
            }

        }

    } else if(elem.tagName !== 'TEXTAREA') {
        note_text.value = '';
    }
} 

note_text.oninput = () => {
    all_notes.forEach(note => {
        if (note.getSelected()) {
            note.setContent(note_text.value);
            note.setDate(create_date(new Date()));
        }
    })
    renderNotes('get');
}

remove_btn.onclick = () => {
    let new_notes = [];
    let copyNote = [...all_notes]
    for (i = 0; i < copyNote.length; i++) {
        if(copyNote[i].getSelected() == false) {
            new_notes.push(copyNote[i]);
        }

    }
    all_notes.splice(0, copyNote.length, ...new_notes);
    renderNotes('get');
    window.location.hash = '';
}

add_btn.onclick = () => {
    renderNotes('add');
    window.location.hash = '';
}


