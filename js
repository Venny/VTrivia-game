(function ($) {  //ako bude optimizirano za druga biblioteka, a ne jQuery
var serviceRootUrl = 'http://trivia-game.apphb.com/api/trivia';



$(document).ready(function() {
    $("#reg-nav-btn").on("click", onRegNavBtnClick);
    $("#login-nav-btn").on("click", onLoginNavBtnClick);
    $("#users-nav-btn").on("click", onUsersNavBtnClick);
    $("#cat-nav-btn").on("click", onCategoryNavBtnClick);
});


                                // Main nav buttons functions
function onRegNavBtnClick(e) {
    var regFormHTML =
        '<form id="reg-form">' +
            '<label for="tb-username">Username</label>' +
             '<input type="text" id="tb-username" autofocus="autofocus" /> <br/>' +
             '<label for="tb-nickname">Nickname</label>' +
             '<input type="text" id="tb-nickname"/> <br/>' +
             '<label for="tb-pass">Password</label>' +
             '<input type="password" id="tb-pass"/> <br/>' +
             '<label for="tb-repeat-pass">Repeat password</label>' +
             '<input type="password" id="tb-repeat-pass"/> <br/>' +
             '<button id="reg-btn">Register</button>' +
        '</form>';

    $("#main-content").html(regFormHTML);
    $("#reg-btn").on("click", onRegBtnClick);
};
function onLoginNavBtnClick(e) {
    var loginFormHTML =
        '<form id="login-form">' +
             '<label for="tb-login-username">Username</label>' +
             '<input type="text" id="tb-login-username" autofocus="autofocus" /> <br/>' +
             '<label for="tb-login-pass">Password</label>' +
             '<input type="password" id="tb-login-pass"/> <br/>' +
             '<button id="login-btn">Login</button>' +
        '</form>';

    $("#login-form").slideDown("slow");
    $("#main-content").html(loginFormHTML);
    $("#login-btn").on("click", onLoginBtnClick);
};
function onUsersNavBtnClick() {
    var usersFormHTML =
        '<form id="users-form">' +
          '<label for="tb-nickname-search">Nickname</label>' +
            '<input type="text" id="tb-nickname-search" autofocus="autofocus" />' +
            '<button id="search-nickname-btn">Search</button>' +
            '<button id="all-users-btn">Show all users</button>' +
        '</form>' +
        ' <div id="user-info"></div>'
    $("#main-content").html(usersFormHTML);
    $("#search-nickname-btn").on("click", onNickSearchBtnClick);
    $("#all-users-btn").on("click", onAllUsersBtnClick);
};
function onCategoryNavBtnClick() {
    performGetRequest(serviceRootUrl + "/categories", onCategoriesSuccess, onSomeError);
};


                               // Detailed functionality
function onRegBtnClick(e) {

    var userData = collectData();
    var validPass = validatePass(userData),
         validUser = validateUsername(userData),
         validNick = validateNickname(userData);
 
    if (validPass == false || validUser == false || validNick == false) {
        return false;
    }

    var hashCode = createAuthCode(userData),
        name = userData.username,
        nick = userData.nickname;

    var user = {
        "username": name,
        "nickname": nick,
        "authCode": hashCode
    };
    console.log(JSON.stringify(user));
    /*
    {
        "username":"Dodo",
        "nickname":"DonchoMinkov",
        "authCode":" e3adcdcff8fe40290d7bbd3c19a1e414425e5aaa "
    }
    */
    performPostRequest(serviceRootUrl + '/register-user', user, onUserRegisterSuccess, onSomeError);

    e.preventDefault();

};
function onLoginBtnClick(e) {

        var userData = collectLoginData();
        var validUser = validateUsername(userData);
        if (validUser == false) {
            return false;
        }

        var hashCode = createAuthCode(userData),
            name = userData.username;

        var user = {
            "username": name,
            "authCode": hashCode
        };

                    // Put the object into storage
      window.sessionStorage.setItem('user', JSON.stringify(user));  // izpolzvane na biblioteka za support na IE

        //console.log(JSON.stringify(user));
        
        /*
        {
            "username":"Dodo", 
            "authCode":" e3adcdcff8fe40290d7bbd3c19a1e414425e5aaa "
        }
        */
        performPostRequest(serviceRootUrl + '/login-user', user, onUserLoginSuccess, onSomeError);

        e.preventDefault();
};
function onNickSearchBtnClick(e) {
    var userData = collectNicknameData();
    var validNick = validateNickname(userData);
    if (validNick == false) {
        return false;
    }
    performGetRequest( serviceRootUrl + '/user-score?nickname=' + userData.nickname, onUserSearchSuccess, onSomeError );
    e.preventDefault();
};
function onUserTableBtnClick(e) {
    var userData = $(this).data('nickname');
    console.log(userData)
    performGetRequest(serviceRootUrl + '/user-score?nickname=' + userData, onUserSearchSuccess, onSomeError);
    e.preventDefault();
}
function onAllUsersBtnClick(e) {
    performGetRequest(serviceRootUrl + '/users-all', onAllUsersSuccess, onSomeError);
    e.preventDefault();
};

    //#region After login
                              // After login. Nav-buttons functions
var nextQ = 1,
    categoryQuestions = new Array();
function onNewCatBtnClick() {

    categoryQuestions = new Array();
    var newCat = '<form id="new-cat-form">' +
	'<label for ="new-category">Category name:</label>' +
    '<input type="text" autofocus="autofocus" id="new-category"/><br/><br/>' +
        '<div id="quest-container">';
    nextQ = 1;
    newCat += HTMLQuestGenerator(nextQ);
    newCat += '<div>Note: You have to add at least 10 questions.    </div>' +
        '<button id ="next-quest-btn">Next question --></button>' +
     '</div></form>';
 
    $('#main-content').html(newCat);
        $('#correct-answer-btn').on('click', onCorrectAnswerBtnClick);
        $('#wrong-answer-btn').on('click', onWrongAnswerBtnClick);
        $('#next-quest-btn').on('click', onNextQuestClick);
}
function onPlayNavBtnClick() {
    performGetRequest(serviceRootUrl + '/categories', onPlayChoiceSuccess, onSomeError);
}
function onNewQuestionBtnClick() {
    // Pri post metoda : var postData = JSON.stringify(userData); 
    // zashtoto inache ne dobavq vupros
    performGetRequest(serviceRootUrl + '/categories', onAddNewQuestBtnSuccess, onSomeError);
}

    //#endregion
                            // Detailed functionality
function onCorrectAnswerBtnClick(e) {
    var oneMoreAnswer = '<label>Correct answer: ' +
                        '<textarea rows="1" cols="40" name="correct-answer"></textarea></label></br>';
    $('#correct-answer-btn').before(oneMoreAnswer);
    e.preventDefault();
};
function onWrongAnswerBtnClick(e) {
    var oneMoreAnswer = '<label>Wrong answer: ' +
                        '<textarea rows="1" cols="40" name="wrong-answer"></textarea></label></br>';
    $('#wrong-answer-btn').before(oneMoreAnswer);
    e.preventDefault();
};
function onNextQuestClick(e) {
    var anotherQuest = addAnotherQuestData(categoryQuestions);
    if (anotherQuest == false) {
        return false;
    };
    nextQ += 1;
    var newQuest = HTMLQuestGenerator(nextQ);
    newQuest += '<div>Note: You have to add at least 10 questions.    </div>' +
        '<button id ="next-quest-btn">Next question --></button>'+
   '</div></form>';

    $('#quest-container').html(newQuest);
    if (nextQ >= 10) {
        $('#quest-container').append('<br /><button id="finish">Finish</button><br />');
    }

    $('#correct-answer-btn').on('click', onCorrectAnswerBtnClick);
    $('#wrong-answer-btn').on('click', onWrongAnswerBtnClick);
    $('#next-quest-btn').on('click', onNextQuestClick);
    $('#finish').on('click', onFinishCatBtnClick);
};
function onFinishCatBtnClick(e) {
    // Retrieve the object from storage 
    var retrieveloginData = window.sessionStorage.getItem('user');
    var loginData = JSON.parse(retrieveloginData);

    var theFinalQuests = addAnotherQuestData(categoryQuestions);  // Za vzemane na posledniq vupros
    if (theFinalQuests == false) {
        return false;
    };
    var categoryQuest = collectCategoryData(categoryQuestions);

    console.log("The whole object:" + JSON.stringify(categoryQuest));
   
    var newCatObject = {
        category: categoryQuest,
        user: loginData
    }
    performPostRequest(serviceRootUrl + '/add-category', newCatObject, onSendNewCatSuccess, onSomeError);
        e.preventDefault();
};
    var gameIdNumber = 0;
function onStartNewGameBtnClick(e) {
    var selectedIndex = document.getElementById('play-a-game').selectedIndex;
    var options = document.getElementById("play-a-game").options;   
    gameIdNumber = options[selectedIndex].value;
    //alert(gameIdNumber);
    var retrieveloginData = window.sessionStorage.getItem('user');
    var loginData = JSON.parse(retrieveloginData);

                                        //  Moga da pravq samo po edna zaqvka na vseki 5 min.
    performPostRequest(serviceRootUrl + '/start-game/' + gameIdNumber, loginData, onStartGameBtnSuccess, onSomeError);
    e.preventDefault();
}
var nextGameQ = 0;
var storedAnswers = new Array();
var userQuestData = '';

function onNextGameQuestBtnClick() {
    collectUserAnswersData();
    nextGameQ += 1
    var questData = userQuestData;
    var HTMLQuest = HTMLGameQuestGenerator(questData);
    if (nextGameQ == 9) {
        HTMLQuest += '<button id="finish-game-quest">Finish></button>';
    }
    else {
        HTMLQuest += '<button id="next-game-quest"> Next > </button>';
    }

    $('#main-content').html(HTMLQuest);
    $('#next-game-quest').on('click', onNextGameQuestBtnClick);
    $('#finish-game-quest').on('click', onFinshGameQuestBtnClick);
};
function onFinshGameQuestBtnClick(e) {
    collectUserAnswersData();
    // Retrieve the object from storage 
        var retrieveloginData = window.sessionStorage.getItem('user');
        var loginData = JSON.parse(retrieveloginData);

    var finishedGame = {
        user: loginData,
        questions: storedAnswers
    }
    console.log(finishedGame);
    console.log(JSON.stringify(finishedGame));
    //alert(gameIdNumber);

    performPostRequest(serviceRootUrl + '/post-answers/' + gameIdNumber, finishedGame, onSubmitAnswersSuccess, onSomeError);
    e.preventDefault();
}
function onAddNewQuestBtnClick(e) {
    var questData = '<div><form>'
    questData += HTMLQuestGenerator(0);
    questData += '<button id ="add-quest-btn">Add it --></button>' +
    '</div></form>';

    var selectedIndex = document.getElementById('play-a-game').selectedIndex;
    var options = document.getElementById("play-a-game").options;
    gameIdNumber = options[selectedIndex].value;
   // alert(gameIdNumber);

    $('#main-content').html(questData);
    $('#correct-answer-btn').on('click', onCorrectAnswerBtnClick);
    $('#wrong-answer-btn').on('click', onWrongAnswerBtnClick);
    $('#add-quest-btn').on('click', addItBtnClick);
    e.preventDefault();
};
function addItBtnClick(e) {
    // Retrieve the object from storage 
    var retrieveloginData = window.sessionStorage.getItem('user');
    var loginData = JSON.parse(retrieveloginData);
    var questData = collectQuestionData();
    if (validateQuestData(questData) == false) {
        return false;
    }

    console.log(questData + "gameIdNumber: " + gameIdNumber);
    var questionData = {
        user: loginData,
        question: questData
    }
    performPostRequest(serviceRootUrl + '/add-question/' + gameIdNumber, questionData, onSubmitQuestionSuccess, onSomeError);
    e.preventDefault();
}


                            // Successs & error functions; timer function
    function onUserRegisterSuccess(data) {
        var regUserHTML = '<div>' +
                                    'You are registered !' +
                            '</div>';


        $('#main-content').html(regUserHTML);
    };
    function onUserLoginSuccess() {
        var loginPermissions = '<li>' +
                                   '<a href="#" id= "play-btn">PLAY</a>' +
		                      '</li>' +
                              '<li>' +
                                   '<a href="#" id= "new-question"> New question + </a>'+
                              '</li>' +
                              '<li>' +
                                   '<a href="#" id= "new-cat">New category +</a>' +
                              '</li>';
        var someAfterLoginText = '<div>' +
                                       "Welcome ! Play a game or add a question! :)" +
                                 '</div>';
        // Retrieve the object from storage 
        var retrieveloginData = window.sessionStorage.getItem('user');
        var loginData = JSON.parse(retrieveloginData);
        var userNameHTML = '<div class="user-name-container">' +
                                    'Hellow, ' + loginData.username + ' !' +
                            '</div>';
         
        $('aside').prepend(userNameHTML);
        $('#main-nav').append(loginPermissions);
        $('#main-content').html(someAfterLoginText);
        $('#reg-nav-btn').css('display', 'none'); 
        $('#login-nav-btn').css('display', 'none');
        $('#new-cat').on('click', onNewCatBtnClick);
        $('#play-btn').on('click', onPlayNavBtnClick);
        $('#new-question').on('click', onNewQuestionBtnClick);
    };
    function onUserSearchSuccess(user) {
        var score = user.categoryScores;
        var userHTML =
	            '<h3>' + user.nickname + '</h3>' +
	            '<ul>' +
		            '<li>Total score : ' + user.totalScore + '</li>' +
		            '<li>Total games played: ' + user.totalGamesPlayed + '</li>' +
		            '<li>Scores: <ul>' ;

                  for (var i in score) {
                      userHTML += '<li>' +
                                          'Category: ' + score[i].category +
                                  '</li>' +
                                  '<li>' +
                                          'Score: ' + score[i].score +
                                  '</li>' +
                                  '<li>' +
                                          'Played games: ' + score[i].gamesPlayed +
                                  '</li>';
                                        }

        userHTML  += '</ul></li>  </ul>';
        $("#user-info").html(userHTML);
    };
    function onAllUsersSuccess(users) {
        var allUsersHTML = '<table cellspacing="0">' +
	                            '<thead>' +
		                            '<th>Nickname</th>' +
		                            '<th>Score</th>' +
		                            '<th>Games</th>' +
	                            '</thead>'+
	                            '<tfoot>' +
                                    '<tr>'+
		                                '<td colspan="2">Total users: </td>' +
		                                '<td>' + users.length + '</td>' +
                                    '</tr>' +
                                '</tfoot><tbody>';
        for (var i in users) {
            allUsersHTML += '<tr data-nickname="' + users[i].nickname + '">' +
	                            '<td>' + users[i].nickname + '</td>' +
	                            '<td>' + users[i].score + '</td>' +
	                            '<td>' + users[i].games + '</td>' +
                            '</tr>'
        }
        allUsersHTML += '</tbody></table>';
        $("#user-info").html(allUsersHTML);
        $('tbody tr').on('click', onUserTableBtnClick);
    };
    function onCategoriesSuccess(cat) {
        var categoriesHTML = '<ul class="categories">';

        for (var i in cat) {
            categoriesHTML += '<li>' +
		                            '<span class="category-id">Category ' + cat[i].id + ': </span> ' +
                                    '<span class="category-name">' + cat[i].name + '</span>' +
	                          '</li>';
        }
        categoriesHTML += '</ul>';

        $('#main-content').html(categoriesHTML);

    };
    function onSendNewCatSuccess() {

        var newCatHTML = '<div>' +
                                    'You are ready!' +
                            '</div>';


        $('#main-content').html(newCatHTML);
    };
    function onPlayChoiceSuccess(cat) {
        var playChoiceHTML = HTMLCatChoiceGenerator(cat);
    
        playChoiceHTML += '<option value = "">' +
                                        'or just PLAY' +
                             '</option>' +
                        '</select>' +
                        '<button id = "start-game-btn">Start new game</button>' +
                '</form>';


       $('#main-content').html(playChoiceHTML);
       $('#start-game-btn').on('click', onStartNewGameBtnClick);
    };
    function onAddNewQuestBtnSuccess(cat) {
        var playChoiceHTML = HTMLCatChoiceGenerator(cat);

        playChoiceHTML += '</select>' +
                                    '<button id = "add-quest">Add new question</button>' +
                            '</form>';


        $('#main-content').html(playChoiceHTML);
        $('#add-quest').on('click', onAddNewQuestBtnClick);
    };
    function onSubmitQuestionSuccess() {
        var HTMLSubmit = '<div>' +
                                 'Your question has been added !' +
                         '</div>';


        $('#main-content').html(HTMLSubmit);
    }
    function onSubmitAnswersSuccess() {

        var HTMLSubmit = '<div>' +
                                    'You are ready! When the timer finishes you will be able to play again!' +
                            '</div>';
        document.getElementById('play-btn').style.visibility = 'hidden';

        $('#main-content').html(HTMLSubmit);
    } 
    function onStartGameBtnSuccess(quest) {
        //alert(JSON.stringify(quest));
        alert("You have 5 minutes to finish the game! Start!")
        nextGameQ = 0;
        userQuestData = quest;
      
        var data = userQuestData.questions[nextGameQ];
        var HTMLQuest = HTMLGameQuestGenerator(userQuestData);
        HTMLQuest += '<button id="next-game-quest"> Next > </button>';
       
        $('#main-content').html(HTMLQuest);
        var radios = document.getElementsByName('answers');
        for (var i = 0; i < radios.length; i++) {
            if (radios[i].type === 'radio' && radios[i].checked) {
                storedAnswers += radios[i].value;
            }
        }    
        
        gameIdNumber = quest.id;
       // var checkTimer = document.getElementById('Label1');
        if (!($('div#Label1').length)) {
         
            activateTimer();  // timer 
        }
      $('#next-game-quest').on('click', onNextGameQuestBtnClick );
    };
    function onSomeError(err) {

        //var errMessage = JSON.parse(err.responseText); 
        var errMessage = $.parseJSON(err.responseText);
        document.getElementById('error-message-box').style.visibility = 'visible';
        var txt = '<div id = "error-message">' +
                        '<p>There was an error!</p><br />' +
                        '<p>Error description: ' + errMessage.Message + '</p><br />' +
                        '<p>With status: ' + err.status + '</p>' +
                  '</div>';
        var mainMessage = "<div> I'm sorry, there was an error. Please try again later.</div>";

        $('#main-content').html(mainMessage);
        $('#error-message-box div').html(txt);
    };
    var min,
        sec,
        timer,
        timeon;
    function activateTimer() {
        timeon = 0;
        if (!timeon) {
                timeon = 1;
                min = 5;
                sec = 0;
                $('aside').prepend(' <div ID="Label1"></div>');
                Timer();
        }
    } // Start the timer
    function Timer() {
        var _time = min + ":" + sec;
       
        document.getElementById("Label1").innerHTML = _time;
        //document.getElementById("Label1").setAttribute('class', 'count-class');
        if (_time != "0:0") {
            if (sec == 0) {
                min = min - 1;
                sec = 59;
            }
            else {
                sec = sec - 1;
            }
            timer = setTimeout(function () { Timer() }, 1000);
        }
        else {
         //   _time = "Time is Over";
            var timerHTML = document.getElementById("Label1"); //innerHTML = _time;
         
         //   document.getElementById("Label1").setAttribute('class', '');
            timerHTML.parentNode.removeChild(timerHTML);
            document.getElementById('play-btn').style.visibility = 'visible';
        }
    }


                               // Validate it
    function validatePass(data) {
        if (data.pass != data.repeatedPass) {
            if ($('div.input-error-div').length) {
                return;
            }
            else {
                $('#reg-form').append("<div class='input-error-div'>Passwords don't match!</div>")
                return false;
            }
        }
        else {
            return true;
        }
    };
    function validateUsername(data) {
        if (data.username.length < 4) {
            if ($('div.user-error-div').length) {
                return false;
            }
            else {
                $('form').append('<div class="user-error-div">'+
                    'Your username must be at least 4 characters long and less than 30 characters. Do not use invalid characters like: "," "-" "!" etc.'+
                    '</div>')
                return false;
            }
        }
        else if (data.pass.length < 4) {
            if ($('div.pass-error-div').length) {
                return false;
            }
            else {
                $('form').append('<div class="pass-error-div">'+
                    'Your password must be at least 4 characters long and less than 30 characters. Do not use invalid characters like: "," "-" "!" etc.' +
                    '</div>')
                return false;
            }
        }
        else {
            return true;
        }
    };
    function validateNickname(data) {
        if (data.nickname.length < 4) {
            if ($('div.nick-error-div').length) {
                return false;
            }
            else {
                $('form').append('<div class="nick-error-div">' +
                    'Your nickname must be at least 4 characters long and less than 30 characters.  Do not use invalid characters like: "," "-" "!" etc.' +
                    '</div>')
                return false;
            }
        }
        else {
            return true;
        }
    };
    function validateQuestData(questData) {
        if (questData == false) {
            if ($('div.validation-quest-div').length) {
                return false;
            }
            else {
                $('form').append('<div class="validation-quest-div">You have to fill all fields!</div>')
                return false;
            }
        }
    }


                               // HTML generators
    function createAuthCode(data) {
        var name = data.username,
            pass = data.pass,
            sum = name + pass;
        // Pri vkliuchena SH1 biblioteka
        var hash = CryptoJS.SHA1(sum);
        hash = hash.toString();  // Preminavane v 16-tichen kod
        return hash;
    };
    function HTMLQuestGenerator(Count)  {
        var newQuest = '<label>Question No.' + Count + ' :' +
                '<textarea rows="1" cols="40" class="question"></textarea></label><br/>' +
                '<label>Correct answer :' +
                '<textarea rows="1" cols="40" name="correct-answer"></textarea></label></br>' +
                '<button id ="correct-answer-btn">One more?</button><br/>' +

                '<label>Wrong answers 1:' +
                '<textarea rows="1" cols="40" name="wrong-answer"></textarea></label><br/>' +
                 '<label>Wrong answers 2:' +
                '<textarea rows="1" cols="40" name="wrong-answer"></textarea></label><br/>' +
                 '<label>Wrong answers 3:' +
                '<textarea rows="1" cols="40" name="wrong-answer"></textarea></label></br>' +
                '<button id ="wrong-answer-btn" >One more?</button><br/><br/>';
            
        return newQuest
    }
    function HTMLGameQuestGenerator(questData) {
        var data = questData.questions[nextGameQ];
        var question = '<form id="game-form">' +
                            '<div id = "quest-container" data-value="' + data.id + '">' + data.text + '</div>' +
                            '<label><input type="radio" name="answers" value="' + data.answers[0].id + '"/>' + data.answers[0].text + '</label><br/>' +
                            '<label><input type="radio" name="answers" value="' + data.answers[1].id + '"/>' + data.answers[1].text + '</label><br/>' +
                            '<label><input type="radio" name="answers" value="' + data.answers[2].id + '"/>' + data.answers[2].text + '</label><br/>' +
                            '<label><input type="radio" name="answers" value="' + data.answers[3].id + '"/>' + data.answers[3].text + '</label><br/>' +
                       '</form>';

                       return question;
    };
    function HTMLCatChoiceGenerator(cat) {
       var HTMLForm = '<form>' +
                   '<label>Select a Category.</label>' +
                   '<select id="play-a-game">';

       for (var i in cat) {
           HTMLForm += '<option value = ' + cat[i].id + '>' +
                                        cat[i].id + '.  ' + cat[i].name +
                             '</option>';
       };

       return HTMLForm;
    }


                               // Collecting Data
    function collectData() {
        var user = {
            username: $("#tb-username").val(),
            nickname: $("#tb-nickname").val(),
            pass: $("#tb-pass").val(),
            repeatedPass: $("#tb-repeat-pass").val()
        }
        return user;
    };
    function collectLoginData() {
        var user = {
            username: $("#tb-login-username").val(),
            pass: $("#tb-login-pass").val()
        }
        return user;
    };
    function collectNicknameData() {
        var user = {
            nickname: $("#tb-nickname-search").val()
        }
        return user;
    };
    function collectCorrectAns() {
        var collectedCorrect = document.getElementsByName("correct-answer");
        var cAns = new Array();
        for (var i = 0; i < collectedCorrect.length; i++) {
            var correctAns = collectedCorrect[i].value;
            if (correctAns != "") {
                cAns.push({
                    text: correctAns
                });
            }
        }
        console.log(cAns);
    };
    function collectQuestionData() {
        var collectedCorrect = document.getElementsByName("correct-answer");
        var collectedWrong = document.getElementsByName("wrong-answer");

        console.log(collectedCorrect[0].value);
        console.log(collectedWrong[1].value);

        var cAns = new Array();
        var wAns = new Array();

        for (var i = 0; i < collectedCorrect.length; i++) {
            var correctAns = collectedCorrect[i].value;
            if (correctAns != "") {
                cAns.push({
                    text: correctAns
                });
            }
            else {
                return false;
            }
        }
        for (var i = 0; i < collectedWrong.length; i++) {
            var wrongAns = collectedWrong[i].value;
            if (wrongAns != "") {
                wAns.push({
                    text: wrongAns
                });
            }
            else {
                return false;
            }
        }
        var newQuestion = {
            text: $('.question').val(),
            correctAnswers: cAns,
            wrongAnswers: wAns
        }

        return newQuestion;
    };
    function addAnotherQuestData(arrName) {
        var newQuestion = collectQuestionData();
        if (newQuestion != false) {
            arrName.push(newQuestion);
            console.log(arrName);
            return arrName;
        }
        else {
            validateQuestData(newQuestion);
            return false;
        }
    }
    function collectCategoryData(allQuestions) {
        var newCat = {
                name: $('#new-category').val(),
                questions: allQuestions
        }

       return newCat;
    };
    function collectUserAnswersData() {
        var radios = document.getElementsByName('answers'),
            checkedAns = "";
        for (var i = 0; i < radios.length; i++) {
            if (radios[i].checked) {
                checkedAns += radios[i].value;
            }
        }
        var questId = $('#quest-container').data('value');
        var allAnswers = {
            questionId: questId,
            answerId: checkedAns
        }
        console.log(JSON.stringify(allAnswers));
        storedAnswers.push(allAnswers);
        console.log(storedAnswers);
        return storedAnswers;
    }

                               // Requests
    function performGetRequest(serviceUrl, onSuccess, onError) {
        // Fix for IE browser - don't work on Localhost !!!! 
        $.support.cors = true;
        $.ajax({
            url: serviceUrl,
            type: 'GET',
            timeout: 10000,
            dataType: 'json',
            success: onSuccess,
            error: onError,
            crossDomain: true,                  
            async: true, 
            cache:false  // za da ne pazi cache za stranicata i vinagi da prezarejda ot failovete na survura
        });
    };
    function performPostRequest(serviceUrl, data, onSuccess, onError) {
        //  Fix for IE browser - don't work on Localhost !!!! 
        $.support.cors = true;
            $.ajax({
                url: serviceUrl,
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json; charset=utf-8',
                timeout: 10000,
                success: onSuccess,
                error: onError,
                crossDomain: true, // Po default crossDomain i async sa si true, no gi pisha zaradi IE
                async: false,
                dataType: 'json', // Neobhodimo e za Mozilla, za6toto ne izpulnqva dobre POST zaqvkata v onStartNewGameBtnClick()
                cache: false
            });
    };

})(jQuery);(function ($) {  //ako bude optimizirano za druga biblioteka, a ne jQuery
var serviceRootUrl = 'http://trivia-game.apphb.com/api/trivia';



$(document).ready(function() {
    $("#reg-nav-btn").on("click", onRegNavBtnClick);
    $("#login-nav-btn").on("click", onLoginNavBtnClick);
    $("#users-nav-btn").on("click", onUsersNavBtnClick);
    $("#cat-nav-btn").on("click", onCategoryNavBtnClick);
});


                                // Main nav buttons functions
function onRegNavBtnClick(e) {
    var regFormHTML =
        '<form id="reg-form">' +
            '<label for="tb-username">Username</label>' +
             '<input type="text" id="tb-username" autofocus="autofocus" /> <br/>' +
             '<label for="tb-nickname">Nickname</label>' +
             '<input type="text" id="tb-nickname"/> <br/>' +
             '<label for="tb-pass">Password</label>' +
             '<input type="password" id="tb-pass"/> <br/>' +
             '<label for="tb-repeat-pass">Repeat password</label>' +
             '<input type="password" id="tb-repeat-pass"/> <br/>' +
             '<button id="reg-btn">Register</button>' +
        '</form>';

    $("#main-content").html(regFormHTML);
    $("#reg-btn").on("click", onRegBtnClick);
};
function onLoginNavBtnClick(e) {
    var loginFormHTML =
        '<form id="login-form">' +
             '<label for="tb-login-username">Username</label>' +
             '<input type="text" id="tb-login-username" autofocus="autofocus" /> <br/>' +
             '<label for="tb-login-pass">Password</label>' +
             '<input type="password" id="tb-login-pass"/> <br/>' +
             '<button id="login-btn">Login</button>' +
        '</form>';

    $("#login-form").slideDown("slow");
    $("#main-content").html(loginFormHTML);
    $("#login-btn").on("click", onLoginBtnClick);
};
function onUsersNavBtnClick() {
    var usersFormHTML =
        '<form id="users-form">' +
          '<label for="tb-nickname-search">Nickname</label>' +
            '<input type="text" id="tb-nickname-search" autofocus="autofocus" />' +
            '<button id="search-nickname-btn">Search</button>' +
            '<button id="all-users-btn">Show all users</button>' +
        '</form>' +
        ' <div id="user-info"></div>'
    $("#main-content").html(usersFormHTML);
    $("#search-nickname-btn").on("click", onNickSearchBtnClick);
    $("#all-users-btn").on("click", onAllUsersBtnClick);
};
function onCategoryNavBtnClick() {
    performGetRequest(serviceRootUrl + "/categories", onCategoriesSuccess, onSomeError);
};


                               // Detailed functionality
function onRegBtnClick(e) {

    var userData = collectData();
    var validPass = validatePass(userData),
         validUser = validateUsername(userData),
         validNick = validateNickname(userData);
 
    if (validPass == false || validUser == false || validNick == false) {
        return false;
    }

    var hashCode = createAuthCode(userData),
        name = userData.username,
        nick = userData.nickname;

    var user = {
        "username": name,
        "nickname": nick,
        "authCode": hashCode
    };
    console.log(JSON.stringify(user));
    /*
    {
        "username":"Dodo",
        "nickname":"DonchoMinkov",
        "authCode":" e3adcdcff8fe40290d7bbd3c19a1e414425e5aaa "
    }
    */
    performPostRequest(serviceRootUrl + '/register-user', user, onUserRegisterSuccess, onSomeError);

    e.preventDefault();

};
function onLoginBtnClick(e) {

        var userData = collectLoginData();
        var validUser = validateUsername(userData);
        if (validUser == false) {
            return false;
        }

        var hashCode = createAuthCode(userData),
            name = userData.username;

        var user = {
            "username": name,
            "authCode": hashCode
        };

                    // Put the object into storage
      window.sessionStorage.setItem('user', JSON.stringify(user));  // izpolzvane na biblioteka za support na IE

        //console.log(JSON.stringify(user));
        
        /*
        {
            "username":"Dodo", 
            "authCode":" e3adcdcff8fe40290d7bbd3c19a1e414425e5aaa "
        }
        */
        performPostRequest(serviceRootUrl + '/login-user', user, onUserLoginSuccess, onSomeError);

        e.preventDefault();
};
function onNickSearchBtnClick(e) {
    var userData = collectNicknameData();
    var validNick = validateNickname(userData);
    if (validNick == false) {
        return false;
    }
    performGetRequest( serviceRootUrl + '/user-score?nickname=' + userData.nickname, onUserSearchSuccess, onSomeError );
    e.preventDefault();
};
function onUserTableBtnClick(e) {
    var userData = $(this).data('nickname');
    console.log(userData)
    performGetRequest(serviceRootUrl + '/user-score?nickname=' + userData, onUserSearchSuccess, onSomeError);
    e.preventDefault();
}
function onAllUsersBtnClick(e) {
    performGetRequest(serviceRootUrl + '/users-all', onAllUsersSuccess, onSomeError);
    e.preventDefault();
};

    //#region After login
                              // After login. Nav-buttons functions
var nextQ = 1,
    categoryQuestions = new Array();
function onNewCatBtnClick() {

    categoryQuestions = new Array();
    var newCat = '<form id="new-cat-form">' +
	'<label for ="new-category">Category name:</label>' +
    '<input type="text" autofocus="autofocus" id="new-category"/><br/><br/>' +
        '<div id="quest-container">';
    nextQ = 1;
    newCat += HTMLQuestGenerator(nextQ);
    newCat += '<div>Note: You have to add at least 10 questions.    </div>' +
        '<button id ="next-quest-btn">Next question --></button>' +
     '</div></form>';
 
    $('#main-content').html(newCat);
        $('#correct-answer-btn').on('click', onCorrectAnswerBtnClick);
        $('#wrong-answer-btn').on('click', onWrongAnswerBtnClick);
        $('#next-quest-btn').on('click', onNextQuestClick);
}
function onPlayNavBtnClick() {
    performGetRequest(serviceRootUrl + '/categories', onPlayChoiceSuccess, onSomeError);
}
function onNewQuestionBtnClick() {
    // Pri post metoda : var postData = JSON.stringify(userData); 
    // zashtoto inache ne dobavq vupros
    performGetRequest(serviceRootUrl + '/categories', onAddNewQuestBtnSuccess, onSomeError);
}

    //#endregion
                            // Detailed functionality
function onCorrectAnswerBtnClick(e) {
    var oneMoreAnswer = '<label>Correct answer: ' +
                        '<textarea rows="1" cols="40" name="correct-answer"></textarea></label></br>';
    $('#correct-answer-btn').before(oneMoreAnswer);
    e.preventDefault();
};
function onWrongAnswerBtnClick(e) {
    var oneMoreAnswer = '<label>Wrong answer: ' +
                        '<textarea rows="1" cols="40" name="wrong-answer"></textarea></label></br>';
    $('#wrong-answer-btn').before(oneMoreAnswer);
    e.preventDefault();
};
function onNextQuestClick(e) {
    var anotherQuest = addAnotherQuestData(categoryQuestions);
    if (anotherQuest == false) {
        return false;
    };
    nextQ += 1;
    var newQuest = HTMLQuestGenerator(nextQ);
    newQuest += '<div>Note: You have to add at least 10 questions.    </div>' +
        '<button id ="next-quest-btn">Next question --></button>'+
   '</div></form>';

    $('#quest-container').html(newQuest);
    if (nextQ >= 10) {
        $('#quest-container').append('<br /><button id="finish">Finish</button><br />');
    }

    $('#correct-answer-btn').on('click', onCorrectAnswerBtnClick);
    $('#wrong-answer-btn').on('click', onWrongAnswerBtnClick);
    $('#next-quest-btn').on('click', onNextQuestClick);
    $('#finish').on('click', onFinishCatBtnClick);
};
function onFinishCatBtnClick(e) {
    // Retrieve the object from storage 
    var retrieveloginData = window.sessionStorage.getItem('user');
    var loginData = JSON.parse(retrieveloginData);

    var theFinalQuests = addAnotherQuestData(categoryQuestions);  // Za vzemane na posledniq vupros
    if (theFinalQuests == false) {
        return false;
    };
    var categoryQuest = collectCategoryData(categoryQuestions);

    console.log("The whole object:" + JSON.stringify(categoryQuest));
   
    var newCatObject = {
        category: categoryQuest,
        user: loginData
    }
    performPostRequest(serviceRootUrl + '/add-category', newCatObject, onSendNewCatSuccess, onSomeError);
        e.preventDefault();
};
    var gameIdNumber = 0;
function onStartNewGameBtnClick(e) {
    var selectedIndex = document.getElementById('play-a-game').selectedIndex;
    var options = document.getElementById("play-a-game").options;   
    gameIdNumber = options[selectedIndex].value;
    //alert(gameIdNumber);
    var retrieveloginData = window.sessionStorage.getItem('user');
    var loginData = JSON.parse(retrieveloginData);

                                        //  Moga da pravq samo po edna zaqvka na vseki 5 min.
    performPostRequest(serviceRootUrl + '/start-game/' + gameIdNumber, loginData, onStartGameBtnSuccess, onSomeError);
    e.preventDefault();
}
var nextGameQ = 0;
var storedAnswers = new Array();
var userQuestData = '';

function onNextGameQuestBtnClick() {
    collectUserAnswersData();
    nextGameQ += 1
    var questData = userQuestData;
    var HTMLQuest = HTMLGameQuestGenerator(questData);
    if (nextGameQ == 9) {
        HTMLQuest += '<button id="finish-game-quest">Finish></button>';
    }
    else {
        HTMLQuest += '<button id="next-game-quest"> Next > </button>';
    }

    $('#main-content').html(HTMLQuest);
    $('#next-game-quest').on('click', onNextGameQuestBtnClick);
    $('#finish-game-quest').on('click', onFinshGameQuestBtnClick);
};
function onFinshGameQuestBtnClick(e) {
    collectUserAnswersData();
    // Retrieve the object from storage 
        var retrieveloginData = window.sessionStorage.getItem('user');
        var loginData = JSON.parse(retrieveloginData);

    var finishedGame = {
        user: loginData,
        questions: storedAnswers
    }
    console.log(finishedGame);
    console.log(JSON.stringify(finishedGame));
    //alert(gameIdNumber);

    performPostRequest(serviceRootUrl + '/post-answers/' + gameIdNumber, finishedGame, onSubmitAnswersSuccess, onSomeError);
    e.preventDefault();
}
function onAddNewQuestBtnClick(e) {
    var questData = '<div><form>'
    questData += HTMLQuestGenerator(0);
    questData += '<button id ="add-quest-btn">Add it --></button>' +
    '</div></form>';

    var selectedIndex = document.getElementById('play-a-game').selectedIndex;
    var options = document.getElementById("play-a-game").options;
    gameIdNumber = options[selectedIndex].value;
   // alert(gameIdNumber);

    $('#main-content').html(questData);
    $('#correct-answer-btn').on('click', onCorrectAnswerBtnClick);
    $('#wrong-answer-btn').on('click', onWrongAnswerBtnClick);
    $('#add-quest-btn').on('click', addItBtnClick);
    e.preventDefault();
};
function addItBtnClick(e) {
    // Retrieve the object from storage 
    var retrieveloginData = window.sessionStorage.getItem('user');
    var loginData = JSON.parse(retrieveloginData);
    var questData = collectQuestionData();
    if (validateQuestData(questData) == false) {
        return false;
    }

    console.log(questData + "gameIdNumber: " + gameIdNumber);
    var questionData = {
        user: loginData,
        question: questData
    }
    performPostRequest(serviceRootUrl + '/add-question/' + gameIdNumber, questionData, onSubmitQuestionSuccess, onSomeError);
    e.preventDefault();
}


                            // Successs & error functions; timer function
    function onUserRegisterSuccess(data) {
        var regUserHTML = '<div>' +
                                    'You are registered !' +
                            '</div>';


        $('#main-content').html(regUserHTML);
    };
    function onUserLoginSuccess() {
        var loginPermissions = '<li>' +
                                   '<a href="#" id= "play-btn">PLAY</a>' +
		                      '</li>' +
                              '<li>' +
                                   '<a href="#" id= "new-question"> New question + </a>'+
                              '</li>' +
                              '<li>' +
                                   '<a href="#" id= "new-cat">New category +</a>' +
                              '</li>';
        var someAfterLoginText = '<div>' +
                                       "Welcome ! Play a game or add a question! :)" +
                                 '</div>';
        // Retrieve the object from storage 
        var retrieveloginData = window.sessionStorage.getItem('user');
        var loginData = JSON.parse(retrieveloginData);
        var userNameHTML = '<div class="user-name-container">' +
                                    'Hellow, ' + loginData.username + ' !' +
                            '</div>';
         
        $('aside').prepend(userNameHTML);
        $('#main-nav').append(loginPermissions);
        $('#main-content').html(someAfterLoginText);
        $('#reg-nav-btn').css('display', 'none'); 
        $('#login-nav-btn').css('display', 'none');
        $('#new-cat').on('click', onNewCatBtnClick);
        $('#play-btn').on('click', onPlayNavBtnClick);
        $('#new-question').on('click', onNewQuestionBtnClick);
    };
    function onUserSearchSuccess(user) {
        var score = user.categoryScores;
        var userHTML =
	            '<h3>' + user.nickname + '</h3>' +
	            '<ul>' +
		            '<li>Total score : ' + user.totalScore + '</li>' +
		            '<li>Total games played: ' + user.totalGamesPlayed + '</li>' +
		            '<li>Scores: <ul>' ;

                  for (var i in score) {
                      userHTML += '<li>' +
                                          'Category: ' + score[i].category +
                                  '</li>' +
                                  '<li>' +
                                          'Score: ' + score[i].score +
                                  '</li>' +
                                  '<li>' +
                                          'Played games: ' + score[i].gamesPlayed +
                                  '</li>';
                                        }

        userHTML  += '</ul></li>  </ul>';
        $("#user-info").html(userHTML);
    };
    function onAllUsersSuccess(users) {
        var allUsersHTML = '<table cellspacing="0">' +
	                            '<thead>' +
		                            '<th>Nickname</th>' +
		                            '<th>Score</th>' +
		                            '<th>Games</th>' +
	                            '</thead>'+
	                            '<tfoot>' +
                                    '<tr>'+
		                                '<td colspan="2">Total users: </td>' +
		                                '<td>' + users.length + '</td>' +
                                    '</tr>' +
                                '</tfoot><tbody>';
        for (var i in users) {
            allUsersHTML += '<tr data-nickname="' + users[i].nickname + '">' +
	                            '<td>' + users[i].nickname + '</td>' +
	                            '<td>' + users[i].score + '</td>' +
	                            '<td>' + users[i].games + '</td>' +
                            '</tr>'
        }
        allUsersHTML += '</tbody></table>';
        $("#user-info").html(allUsersHTML);
        $('tbody tr').on('click', onUserTableBtnClick);
    };
    function onCategoriesSuccess(cat) {
        var categoriesHTML = '<ul class="categories">';

        for (var i in cat) {
            categoriesHTML += '<li>' +
		                            '<span class="category-id">Category ' + cat[i].id + ': </span> ' +
                                    '<span class="category-name">' + cat[i].name + '</span>' +
	                          '</li>';
        }
        categoriesHTML += '</ul>';

        $('#main-content').html(categoriesHTML);

    };
    function onSendNewCatSuccess() {

        var newCatHTML = '<div>' +
                                    'You are ready!' +
                            '</div>';


        $('#main-content').html(newCatHTML);
    };
    function onPlayChoiceSuccess(cat) {
        var playChoiceHTML = HTMLCatChoiceGenerator(cat);
    
        playChoiceHTML += '<option value = "">' +
                                        'or just PLAY' +
                             '</option>' +
                        '</select>' +
                        '<button id = "start-game-btn">Start new game</button>' +
                '</form>';


       $('#main-content').html(playChoiceHTML);
       $('#start-game-btn').on('click', onStartNewGameBtnClick);
    };
    function onAddNewQuestBtnSuccess(cat) {
        var playChoiceHTML = HTMLCatChoiceGenerator(cat);

        playChoiceHTML += '</select>' +
                                    '<button id = "add-quest">Add new question</button>' +
                            '</form>';


        $('#main-content').html(playChoiceHTML);
        $('#add-quest').on('click', onAddNewQuestBtnClick);
    };
    function onSubmitQuestionSuccess() {
        var HTMLSubmit = '<div>' +
                                 'Your question has been added !' +
                         '</div>';


        $('#main-content').html(HTMLSubmit);
    }
    function onSubmitAnswersSuccess() {

        var HTMLSubmit = '<div>' +
                                    'You are ready! When the timer finishes you will be able to play again!' +
                            '</div>';
        document.getElementById('play-btn').style.visibility = 'hidden';

        $('#main-content').html(HTMLSubmit);
    } 
    function onStartGameBtnSuccess(quest) {
        //alert(JSON.stringify(quest));
        alert("You have 5 minutes to finish the game! Start!")
        nextGameQ = 0;
        userQuestData = quest;
      
        var data = userQuestData.questions[nextGameQ];
        var HTMLQuest = HTMLGameQuestGenerator(userQuestData);
        HTMLQuest += '<button id="next-game-quest"> Next > </button>';
       
        $('#main-content').html(HTMLQuest);
        var radios = document.getElementsByName('answers');
        for (var i = 0; i < radios.length; i++) {
            if (radios[i].type === 'radio' && radios[i].checked) {
                storedAnswers += radios[i].value;
            }
        }    
        
        gameIdNumber = quest.id;
       // var checkTimer = document.getElementById('Label1');
        if (!($('div#Label1').length)) {
         
            activateTimer();  // timer 
        }
      $('#next-game-quest').on('click', onNextGameQuestBtnClick );
    };
    function onSomeError(err) {

        //var errMessage = JSON.parse(err.responseText); 
        var errMessage = $.parseJSON(err.responseText);
        document.getElementById('error-message-box').style.visibility = 'visible';
        var txt = '<div id = "error-message">' +
                        '<p>There was an error!</p><br />' +
                        '<p>Error description: ' + errMessage.Message + '</p><br />' +
                        '<p>With status: ' + err.status + '</p>' +
                  '</div>';
        var mainMessage = "<div> I'm sorry, there was an error. Please try again later.</div>";

        $('#main-content').html(mainMessage);
        $('#error-message-box div').html(txt);
    };
    var min,
        sec,
        timer,
        timeon;
    function activateTimer() {
        timeon = 0;
        if (!timeon) {
                timeon = 1;
                min = 5;
                sec = 0;
                $('aside').prepend(' <div ID="Label1"></div>');
                Timer();
        }
    } // Start the timer
    function Timer() {
        var _time = min + ":" + sec;
       
        document.getElementById("Label1").innerHTML = _time;
        //document.getElementById("Label1").setAttribute('class', 'count-class');
        if (_time != "0:0") {
            if (sec == 0) {
                min = min - 1;
                sec = 59;
            }
            else {
                sec = sec - 1;
            }
            timer = setTimeout(function () { Timer() }, 1000);
        }
        else {
         //   _time = "Time is Over";
            var timerHTML = document.getElementById("Label1"); //innerHTML = _time;
         
         //   document.getElementById("Label1").setAttribute('class', '');
            timerHTML.parentNode.removeChild(timerHTML);
            document.getElementById('play-btn').style.visibility = 'visible';
        }
    }


                               // Validate it
    function validatePass(data) {
        if (data.pass != data.repeatedPass) {
            if ($('div.input-error-div').length) {
                return;
            }
            else {
                $('#reg-form').append("<div class='input-error-div'>Passwords don't match!</div>")
                return false;
            }
        }
        else {
            return true;
        }
    };
    function validateUsername(data) {
        if (data.username.length < 4) {
            if ($('div.user-error-div').length) {
                return false;
            }
            else {
                $('form').append('<div class="user-error-div">'+
                    'Your username must be at least 4 characters long and less than 30 characters. Do not use invalid characters like: "," "-" "!" etc.'+
                    '</div>')
                return false;
            }
        }
        else if (data.pass.length < 4) {
            if ($('div.pass-error-div').length) {
                return false;
            }
            else {
                $('form').append('<div class="pass-error-div">'+
                    'Your password must be at least 4 characters long and less than 30 characters. Do not use invalid characters like: "," "-" "!" etc.' +
                    '</div>')
                return false;
            }
        }
        else {
            return true;
        }
    };
    function validateNickname(data) {
        if (data.nickname.length < 4) {
            if ($('div.nick-error-div').length) {
                return false;
            }
            else {
                $('form').append('<div class="nick-error-div">' +
                    'Your nickname must be at least 4 characters long and less than 30 characters.  Do not use invalid characters like: "," "-" "!" etc.' +
                    '</div>')
                return false;
            }
        }
        else {
            return true;
        }
    };
    function validateQuestData(questData) {
        if (questData == false) {
            if ($('div.validation-quest-div').length) {
                return false;
            }
            else {
                $('form').append('<div class="validation-quest-div">You have to fill all fields!</div>')
                return false;
            }
        }
    }


                               // HTML generators
    function createAuthCode(data) {
        var name = data.username,
            pass = data.pass,
            sum = name + pass;
        // Pri vkliuchena SH1 biblioteka
        var hash = CryptoJS.SHA1(sum);
        hash = hash.toString();  // Preminavane v 16-tichen kod
        return hash;
    };
    function HTMLQuestGenerator(Count)  {
        var newQuest = '<label>Question No.' + Count + ' :' +
                '<textarea rows="1" cols="40" class="question"></textarea></label><br/>' +
                '<label>Correct answer :' +
                '<textarea rows="1" cols="40" name="correct-answer"></textarea></label></br>' +
                '<button id ="correct-answer-btn">One more?</button><br/>' +

                '<label>Wrong answers 1:' +
                '<textarea rows="1" cols="40" name="wrong-answer"></textarea></label><br/>' +
                 '<label>Wrong answers 2:' +
                '<textarea rows="1" cols="40" name="wrong-answer"></textarea></label><br/>' +
                 '<label>Wrong answers 3:' +
                '<textarea rows="1" cols="40" name="wrong-answer"></textarea></label></br>' +
                '<button id ="wrong-answer-btn" >One more?</button><br/><br/>';
            
        return newQuest
    }
    function HTMLGameQuestGenerator(questData) {
        var data = questData.questions[nextGameQ];
        var question = '<form id="game-form">' +
                            '<div id = "quest-container" data-value="' + data.id + '">' + data.text + '</div>' +
                            '<label><input type="radio" name="answers" value="' + data.answers[0].id + '"/>' + data.answers[0].text + '</label><br/>' +
                            '<label><input type="radio" name="answers" value="' + data.answers[1].id + '"/>' + data.answers[1].text + '</label><br/>' +
                            '<label><input type="radio" name="answers" value="' + data.answers[2].id + '"/>' + data.answers[2].text + '</label><br/>' +
                            '<label><input type="radio" name="answers" value="' + data.answers[3].id + '"/>' + data.answers[3].text + '</label><br/>' +
                       '</form>';

                       return question;
    };
    function HTMLCatChoiceGenerator(cat) {
       var HTMLForm = '<form>' +
                   '<label>Select a Category.</label>' +
                   '<select id="play-a-game">';

       for (var i in cat) {
           HTMLForm += '<option value = ' + cat[i].id + '>' +
                                        cat[i].id + '.  ' + cat[i].name +
                             '</option>';
       };

       return HTMLForm;
    }


                               // Collecting Data
    function collectData() {
        var user = {
            username: $("#tb-username").val(),
            nickname: $("#tb-nickname").val(),
            pass: $("#tb-pass").val(),
            repeatedPass: $("#tb-repeat-pass").val()
        }
        return user;
    };
    function collectLoginData() {
        var user = {
            username: $("#tb-login-username").val(),
            pass: $("#tb-login-pass").val()
        }
        return user;
    };
    function collectNicknameData() {
        var user = {
            nickname: $("#tb-nickname-search").val()
        }
        return user;
    };
    function collectCorrectAns() {
        var collectedCorrect = document.getElementsByName("correct-answer");
        var cAns = new Array();
        for (var i = 0; i < collectedCorrect.length; i++) {
            var correctAns = collectedCorrect[i].value;
            if (correctAns != "") {
                cAns.push({
                    text: correctAns
                });
            }
        }
        console.log(cAns);
    };
    function collectQuestionData() {
        var collectedCorrect = document.getElementsByName("correct-answer");
        var collectedWrong = document.getElementsByName("wrong-answer");

        console.log(collectedCorrect[0].value);
        console.log(collectedWrong[1].value);

        var cAns = new Array();
        var wAns = new Array();

        for (var i = 0; i < collectedCorrect.length; i++) {
            var correctAns = collectedCorrect[i].value;
            if (correctAns != "") {
                cAns.push({
                    text: correctAns
                });
            }
            else {
                return false;
            }
        }
        for (var i = 0; i < collectedWrong.length; i++) {
            var wrongAns = collectedWrong[i].value;
            if (wrongAns != "") {
                wAns.push({
                    text: wrongAns
                });
            }
            else {
                return false;
            }
        }
        var newQuestion = {
            text: $('.question').val(),
            correctAnswers: cAns,
            wrongAnswers: wAns
        }

        return newQuestion;
    };
    function addAnotherQuestData(arrName) {
        var newQuestion = collectQuestionData();
        if (newQuestion != false) {
            arrName.push(newQuestion);
            console.log(arrName);
            return arrName;
        }
        else {
            validateQuestData(newQuestion);
            return false;
        }
    }
    function collectCategoryData(allQuestions) {
        var newCat = {
                name: $('#new-category').val(),
                questions: allQuestions
        }

       return newCat;
    };
    function collectUserAnswersData() {
        var radios = document.getElementsByName('answers'),
            checkedAns = "";
        for (var i = 0; i < radios.length; i++) {
            if (radios[i].checked) {
                checkedAns += radios[i].value;
            }
        }
        var questId = $('#quest-container').data('value');
        var allAnswers = {
            questionId: questId,
            answerId: checkedAns
        }
        console.log(JSON.stringify(allAnswers));
        storedAnswers.push(allAnswers);
        console.log(storedAnswers);
        return storedAnswers;
    }

                               // Requests
    function performGetRequest(serviceUrl, onSuccess, onError) {
        // Fix for IE browser - don't work on Localhost !!!! 
        $.support.cors = true;
        $.ajax({
            url: serviceUrl,
            type: 'GET',
            timeout: 10000,
            dataType: 'json',
            success: onSuccess,
            error: onError,
            crossDomain: true,                  
            async: true, 
            cache:false  // za da ne pazi cache za stranicata i vinagi da prezarejda ot failovete na survura
        });
    };
    function performPostRequest(serviceUrl, data, onSuccess, onError) {
        //  Fix for IE browser - don't work on Localhost !!!! 
        $.support.cors = true;
            $.ajax({
                url: serviceUrl,
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json; charset=utf-8',
                timeout: 10000,
                success: onSuccess,
                error: onError,
                crossDomain: true, // Po default crossDomain i async sa si true, no gi pisha zaradi IE
                async: false,
                dataType: 'json', // Neobhodimo e za Mozilla, za6toto ne izpulnqva dobre POST zaqvkata v onStartNewGameBtnClick()
                cache: false
            });
    };

})(jQuery);
