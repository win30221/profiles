from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import simpleSplit
c=canvas.Canvas('assets/hugo-profile-summary.pdf',pagesize=A4)
w,h=A4
c.setTitle('Hugo - Profile Summary (Draft)')
c.setAuthor('Hugo')
c.setFillColor(HexColor('#f1f2eb'));c.rect(0,0,w,h,fill=1,stroke=0)
c.setFillColor(HexColor('#263320'));c.rect(0,h-185,w,185,fill=1,stroke=0)
c.setFillColor(HexColor('#bfd69b'));c.setFont('Courier',9);c.drawString(48,h-49,'HUGO OS / PROFILE SUMMARY / DRAFT')
c.setFillColor(HexColor('#f1f2eb'));c.setFont('Helvetica-Bold',42);c.drawString(46,h-109,'HUGO')
c.setFont('Helvetica',13);c.drawString(49,h-142,'Backend Engineer / Engineering Manager')
y=h-226

def heading(label):
 global y
 c.setFillColor(HexColor('#4b6040'));c.setFont('Courier-Bold',10);c.drawString(48,y,label)
 c.setStrokeColor(HexColor('#b7c1aa'));c.line(48,y-11,w-48,y-11);y-=34

def paragraph(text):
 global y
 c.setFillColor(HexColor('#303d28'));c.setFont('Helvetica',11)
 for line in simpleSplit(text,'Helvetica',11,w-96):
  c.drawString(48,y,line);y-=17
 y-=12

heading('01 / PROFILE')
paragraph('Software engineer and engineering manager focused on backend systems, Golang, databases, and engineering leadership.')
paragraph('10+ years in software development\n')
paragraph('8+ years with Golang | 5+ years in team management')
heading('02 / CORE TECHNOLOGIES')
paragraph('Golang, REST, gRPC, Microservices, MySQL, MongoDB, Redis, RabbitMQ, Docker, Kubernetes, GCP')
heading('03 / ENGINEERING & LEADERSHIP')
paragraph('System Design, Performance, Concurrency, Distributed Systems, Team Management, Technical Planning, Code Review, Project Planning, Cross-team Communication')
heading('04 / EXPERIENCE & CONTACT')
paragraph('Company names, employment dates, verified project outcomes, education, and public contact details have not yet been supplied.')
c.setFillColor(HexColor('#67765d'));c.setFont('Courier',8);c.drawString(48,46,'Draft summary using supplied profile details only.');c.drawRightString(w-48,46,'01 / 01')
c.save()
