# MIDN 1/C Gregory Polmatier 

from bs4 import BeautifulSoup
import requests
 
URL = "https://alwaysjudgeabookbyitscover.com/" #<- change to the website of your choice
headers = {"User-Agent": "Mozilla/5.0 (Linux; U; Android 4.2.2; he-il; NEO-X5-116A Build/JDQ39) AppleWebKit/534.30 (""KHTML, like Gecko) Version/4.0 Safari/534.30"}
response = requests.get(URL, headers=headers)
webpage = response.content
soup = BeautifulSoup(webpage, "html.parser")

print(soup.h1.prettify())

f = open("links.txt", "w")

links = soup.findAll('a')
# print(links)

for link in links:
    f.write(link.get('href')+ '\n')