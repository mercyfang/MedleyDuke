// ---------- INITIALIZATION ----------

// INITIALIZE PARSE KEYS

Parse.initialize("gqrp4017xBh0MVxkZ7RdbTZJkOhxjGF2QKVxMqCm", "hWQ5haczg61zAeqAu5yf1kEx3MIaCpIL2SQCv42g");

// ---------- VARIABLES ----------

// DEVICE IDENTIFIERS

var deviceIdentifier = getDeviceIdentifier();

// HTML IDENTIFIERS

var articleTitleIdentifier      = "articleTitle";
var articleTextIdentifier       = "articleText";
var authorNameAndDateIdentifier = "authorNameAndDate";
var numLikesIdentifier          = "numLikes";
var coverImageSourceIdentifier  = "coverImageSource";

var articleImageIdentifier      = "articleImage";
var authorImageIdentifier       = "authorImage";
var likeButtonIdentifier        = "likeButton";

var likeButtonActionIdentifier  = "likeButtonClick";
var shareButtonActionIdentifier = "shareButtonClick";

var prevArrowIdentifier         = "prevArrow";
var nextArrowIdentifier         = "nextArrow";

// PARSE CATEGORY IDENTIFIER

var categoryType = determineCategory();

// CONTAINER FOR ARTICLE IDS FOR THIS CATEGORY

var categoryArticleIDs = [];

// PARSE ARTICLE IDENTIFIERS

var articleIndex;
var articleID;

// DATA NEEDED FROM PARSE PER ARTICLE

var articleTitle;
var articleText;
var authorID;
var authorName;
var articleDate;
var numLikesNumber;
var coverImageName;
var coverImageURL;

var articleImageData;
var authorImageData;

var likedArticles = [];

// DATA THAT NEEDS TO BE COMPUTED PER ARTICLE

var authorNameAndDate;
var numLikesString;
var coverImageString;
var liked;

var articleImagePath;
var authorImagePath;

// DATA CONTAINED LOCALLY

var likeButtonPath         = "files/theme/heart.png";
var likeButtonSelectedPath = "files/theme/heart_selected.png";

var categories = ["news", "albums", "concerts", "playlists"];

// ---------- LOAD THE PAGE ----------

initializeDevice(categoryType);
setButtonActions();

// ---------- COMPUTATION ----------

// FUNCTION: CREATE ARRAY OF ARTICLES FOR THIS CATEGORY

function initializeDevice(categoryName)
{
	// CHECK AND SEE IF YOU NEED TO REDIRECT TO MOBILE APP
	
	redirect();
	
	// GET ARTICLES THAT HAVE BEEN LIKED BASED ON THIS DEVICE, THEN
	// GET ARTICLES FOR THIS CATEGORY AND DISPLAY THE CORRECT ONE.

	var Device = Parse.Object.extend("DesktopDevices");
	var devQuery = new Parse.Query(Device);
	devQuery.equalTo("deviceUid", deviceIdentifier);
	devQuery.find(
	{
		success: function(results) 
		{
			console.log('SUCCESS FINDING DEVICE ARRAY WHEN INITIALIZING THIS PAGE');
			
			if (results.length == 0)
			{
				console.log('NO DEVICES FOUND WHEN INITIALIZING THIS PAGE, MAKE NEW')
				
				var NewDev = Parse.Object.extend("DesktopDevices");
				var newDev = new NewDev();

				newDev.set("deviceUid", deviceIdentifier);
				newDev.set("likedArticles", likedArticles);

				newDev.save(null, 
				{
					success: function(newDev) {console.log('SUCCESSFULLY ADDED THIS DEVICE TO DATABASE');},
					error: function(newDev, error) {console.log('ERROR ADDING THIS DEVICE TO DATABASE:' + error.message);}
				});
			}
			else
			{
				console.log("ONE OR MORE DEVICES FOUND WHEN INITIALIZING, PROCEED WITH FIRST ONE");
				var obj = results[0];
				likedArticles = obj.get("likedArticles");
			}
			
			initializeArticles(categoryName);
		},
		error: function(devError) 
		{
			alert('ERROR GETTING DEVICES WHEN INITIALIZING, PROCEED WITH INITIALIZATION');
			
			initializeArticles(categoryName);
		}
	});
}

function initializeArticles(categoryName)
{
	// GET ARTICLES FOR THIS CATEGORY, AND THEN DISPLAY THE CORRECT ONE
	// BASED ON URL, OR JUST FIRST ONE IF NOT SPECIFIED
	
	var Article = Parse.Object.extend("Article");
	var query = new Parse.Query(Article);
	query.descending("articleDate");
	
	if (contains(categories, categoryName))
	{
		query.equalTo("category", categoryName);
	}
	
	query.find(
	{
		success: function(results) 
		{
			for (var i = 0; i < results.length; i++) 
			{
				var ID = results[i];
				categoryArticleIDs[i] = ID.id;
			}
			
			articleIndex = determineArticleIndex();
			articleID = getArticleID(articleIndex);
			loadPage(articleID);
		},
		error: function(error) 
		{
			// ERROR
		}
	});
}

// FUNCTION: CREATE PARSE ARTICLE OBJECT AND FILL THE PAGE IF SUCCESSFUL

function loadPage(ID)
{
	var ParseArticleObject = Parse.Object.extend("Article");
	var articleQuery = new Parse.Query(ParseArticleObject);
	articleQuery.get(ID, 
	{
		success: function(ArticleObject) 
		{
			articleTitle   = ArticleObject.get("articleTitle");
			articleText    = ArticleObject.get("articleText");
			authorID       = ArticleObject.get("authorID");
			authorName     = ArticleObject.get("authorName");
			articleDate    = ArticleObject.get("articleDate");
			numLikesNumber = ArticleObject.get("numLikes");
			coverImageName = ArticleObject.get("articleImageSourceName");
			coverImageURL  = ArticleObject.get("articleImageSourceURL");
		
			articleImageData = ArticleObject.get("articleImage");
	
			// USE DATA TO GET AUTHOR IMAGE
	
			var ParseAuthorObject = Parse.Object.extend("Author");
			var authorQuery = new Parse.Query(ParseAuthorObject);
			authorQuery.get(authorID,
			{
				success: function(AuthorObject)
				{
					authorImageData = AuthorObject.get("image");
			
					// COMPUTE NEEDED VALUES
			
					authorImagePath = authorImageData.url();
			
					// FILL THE PAGE
			
					document.getElementById(authorImageIdentifier).src = authorImagePath;
				},
				error: function(object2, error2)
				{
					// The object was not retrieved successfully.
					// error is a Parse.Error with an error code and message.
				}
			});
	
			// COMPUTE NEEDED VALUES
		
			authorNameAndDate = generateAuthorNameAndDate(authorName, dateToString(articleDate));
			numLikesString    = generateNumLikes(numLikesNumber);
			coverImageString  = generateCoverImageString(coverImageName, coverImageURL);
	
			articleImagePath = articleImageData.url();
	
			// FILL THE PAGE

			document.getElementById(articleTitleIdentifier).innerHTML      = articleTitle;
			document.getElementById(articleTextIdentifier).innerHTML       = articleText;
			document.getElementById(authorNameAndDateIdentifier).innerHTML = authorNameAndDate;
			document.getElementById(coverImageSourceIdentifier).innerHTML  = coverImageString;
			document.getElementById(articleImageIdentifier).src            = articleImagePath;
			
			setNumLikesLabel();
			setArrows(articleIndex);
			setLikedButtonImage();
			
			// CORRECT THE URL
			
			window.location.hash = ID;
		},
		error: function(object, error) 
		{
			// The object was not retrieved successfully.
			// error is a Parse.Error with an error code and message.
		}
	});
}

// FUNCTION: USE INDEX OF ARTICLE TO GET ARTICLE ID

function getArticleID(index)
{
	return categoryArticleIDs[index];
}

// FUNCTIONS: BUTTON SETUP

function setButtonActions()
{
	document.getElementById(nextArrowIdentifier).onclick = function(){reloadPage(1)};
	document.getElementById(prevArrowIdentifier).onclick = function(){reloadPage(-1)};
	document.getElementById(shareButtonActionIdentifier).onclick = function(){shareArticle()};
	document.getElementById(likeButtonActionIdentifier).onclick = function(){likeArticle()};
}

function setArrows(index)
{
	document.getElementById(prevArrowIdentifier).style.visibility = "visible";
	document.getElementById(nextArrowIdentifier).style.visibility = "visible";
	
	if (index == 0)
	{
		document.getElementById(prevArrowIdentifier).style.visibility = "hidden";
	}
	if (index == categoryArticleIDs.length - 1)
	{
		document.getElementById(nextArrowIdentifier).style.visibility = "hidden";
	}
}

function setLikedButtonImage()
{
	if (liked(articleID))
	{
		document.getElementById(likeButtonIdentifier).src = likeButtonSelectedPath;
	}
	else
	{
		document.getElementById(likeButtonIdentifier).src = likeButtonPath;
	}
}

// FUNCTION: NUM LIKES LABEL SET UP

function setNumLikesLabel()
{
	document.getElementById(numLikesIdentifier).innerHTML = numLikesString;
}

// FUNCTION: SHARE ARTICLES

function shareArticle()
{
	var url = window.location.href;
	alert("To share, copy the following into your favorite platform:\n\nCheck out what I just read in Medley! " + url);
}

// FUNCTION: LIKE ARTICLES

function updateLikes()
{
	if (liked(articleID))
	{
		var index = likedArticles.indexOf(articleID);
		likedArticles.splice(index, 1);
		numLikesNumber = numLikesNumber - 1;
	}
	else
	{
		likedArticles.push(articleID);
		numLikesNumber = numLikesNumber + 1;
	}
	
	numLikesString = generateNumLikes(numLikesNumber);
	setNumLikesLabel();
	setLikedButtonImage();
	
	var ParseArticleObject = Parse.Object.extend("Article");
	var articleQuery = new Parse.Query(ParseArticleObject);
	articleQuery.get(articleID, 
	{
		success: function(ArticleObject) 
		{
			ArticleObject.set("numLikes", numLikesNumber);
			ArticleObject.save(null, 
			{
				success: function(newDev) {console.log('numlikes updated in article');},
				error: function(newDev, error) {console.log('ERROR: numlikes NOT updated in article');}
			});
		},
		error: function(object, error) {console.log("ERROR: couldn't get this article to alter numLikes");}
	});
}

function likeArticle()
{	
	var Device = Parse.Object.extend("DesktopDevices");
	var devQuery = new Parse.Query(Device);
	devQuery.equalTo("deviceUid", deviceIdentifier);
	devQuery.find(
	{
		success: function(results) 
		{
			console.log('SUCCESS FINDING DEVICE OBJECT WHEN SEARCHING TO UPDATE LIKES');
			
			if (results.length == 0)
			{
				console.log('NO DEVICES FOUND WHEN UPDATING LIKES, MAKE NEW');
				
				var NewDev = Parse.Object.extend("DesktopDevices");
				var newDev = new NewDev();
				
				updateLikes();
				
				newDev.set("deviceUid", deviceIdentifier);
				newDev.set("likedArticles", likedArticles);
				newDev.save(null, 
				{
					success: function(newDev) {console.log('NEW DEV OBJECT SAVED WITH UPDATED LIKES');},
					error: function(newDev, error) {console.log('NEW DEV OBJECT NOT SAVED WHEN TRYING TO UPDATE LIKES');}
				});
			}
			else (results.length > 0)
			{
				var obj = results[0];
				
				updateLikes();
				
				obj.set("likedArticles", likedArticles);
				obj.save(null, 
				{
					success: function(newDev) {console.log('ONE OR MORE DEVICES FOUND WHEN UPDATING LIKES. LIKES SAVED.');},
					error: function(newDev, error) {console.log('ONE OR MORE DEVICES FOUND WHEN UPDATING LIKES. BUT ERROR SAVING LIKES');}
				});
			}
		},
		error: function(devError) {}
	});
}

function liked(ID)
{
	return contains(likedArticles, ID);
}

// FUNCTIONS: COOKIES AND GENERATING DEVICE IDENTIFIER

function setCookie(cname, cvalue, exdays) 
{
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) 
{
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) 
	{
        var c = ca[i];
        while (c.charAt(0)==' ') 
		{
			c = c.substring(1);
		}
        if (c.indexOf(name) == 0)
		{
			return c.substring(name.length, c.length);
		}
    }
    return "";
}

function cookieExists(key) 
{
	console.log("CHECKING FOR COOKIE");
    var value = getCookie(key);
	console.log("VALUE: " + value);
    if (value != "") 
	{
        return true;
    }
	else
	{
		return false;
    }
}

function generateUid()
{
	console.log("GENERATING UID FROM GETTIME()");
	var date = new Date();
	console.log("GENERATED: " + date.getTime());
	return String(date.getTime());
}

function getDeviceIdentifier()
{
	console.log("TRYING TO GET DEVICE IDENTIFIER");
	var key = "deviceUid";
	var returnVisitor = cookieExists(key);
	if (returnVisitor)
	{
		console.log("RETURNING VISITOR!");
		console.log("THE EXISTING KEY IS: " + getCookie(key));
		return getCookie(key);
	}
	else
	{
		console.log("NEW VISITOR!");
		var newVisitorId = generateUid();
		console.log("THE NEW KEY IS: " + newVisitorId);
		setCookie(key, newVisitorId, 365);
		return newVisitorId;
	}
}

// FUNCTION: NAVIGATE ARTICLES

function reloadPage(inc)
{
	articleIndex = incrementArticleIndexBy(inc);
	articleID = getArticleID(articleIndex);
	loadPage(articleID);
}

// FUNCTION: NAVIGATE ARRAY

function incrementArticleIndexBy(num)
{
	var newNum = articleIndex + num;
	if (newNum >= 0 && newNum < categoryArticleIDs.length)
	{
		return newNum;
	}
	return articleIndex;
}

// FUNCTION: DETERMINE CATEGORY FROM URL

function determineCategory()
{
	var url = window.location.href;
	if (!contains(url, ".html"))
	{
		return "";
	}
	var parsed = url.split(".html");
	var catName = parsed[0].split("/");
	return catName[catName.length - 1];
}

// FUNCTION: DETERMINE INDEX FROM URL

function determineArticleIndex()
{
	var url = window.location.href;
	var hash = "#";
	if (!contains(url, hash))
	{
		return 0;
	}
	var parsed = url.split(hash);
	var ID = parsed[1];
	var index = categoryArticleIDs.indexOf(ID);
	if (index == -1)
	{
		return 0;
	}
	return index;
}

// FUNCTION: REDIRECT TO MOBILE IF NEEDED

function redirect() //IF APPS NOT DOWNLOADED, OPEN APP STORE
{
	var mobile = onMobile();
	if (mobile == "Android" || mobile == "iOS")
	{
		var url = window.location.href;
		var hash = "#";

		if (contains(url, hash))
		{	
			var parsed = url.split(hash);
			var ID = parsed[1];
			var redirectURL;
	
			if (ID != "") 
			{				
				redirectURL = "medleyduke://" + ID;
				window.location.replace(redirectURL); //ONLY IF THIS IS A SUCCESS. IF NOT, OPEN IN APP STORE
			}
		}
	}	
}

function onMobile()
{
	if(/Android/i.test(navigator.userAgent))
	{
		return "Android";
	}
	if(/iPhone|iPad|iPod/i.test(navigator.userAgent))
	{
		return "iOS";
	}
	return "Mobile";
}

// FUNCTIONS: PREPARE DATA FOR DISPLAY

function imgWidthCompHeight(imgSrcString) // Return <0 if taller than wide, 0 if square, >0 if wider than tall
{
    var imgLoader = new Image(); // create a new image object
	var height = 0;
	var width = 0;
	
    imgLoader.onload = function() // assign onload handler
	{ 
        height = imgLoader.height;
        width = imgLoader.width;
		console.log("height: " + height);
		console.log("width: " + width);
    }
	
    imgLoader.src = url(imgSrcString); // set the image source
	
	console.log("w-h: " + width - height);
	return width - height;
}

function generateNumLikes(num)
{
	if (num == 0)
	{
		return "";
	}
	return "<strong>" + num + "</strong>"
}

function generateAuthorNameAndDate(authorName, date)
{
	return "<strong>" + authorName + "</strong><br/>" + date;
}

function generateCoverImageString(source, url)
{
	return "<em>Cover Image Source: <a href=" + url + ">" + source + "</a></em>";
}
function dateToString(date)
{
	var ampm = "AM";
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var zeroMin = "";
	if (hours >= 12)
	{
		ampm = "PM";
		if (hours >= 13)
		{
			hours = hours-12;
		}
	}
	if (minutes < 10)
	{
		zeroMin = "0";
	}
	return date.toLocaleDateString() + ", " + hours + ":" + zeroMin + minutes + " " + ampm;
}

// FUNCTIONS: USEFUL STUFF

function contains(s, ss)
{
	if (s.indexOf(ss) != -1)
	{
		return true;
	}
	return false;
}
