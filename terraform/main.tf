terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# Simple EC2 instance to run both frontend and backend
resource "aws_instance" "app_server" {
  ami           = "ami-0a51a024e4b0c1050" # Amazon Linux 2023 (latest)
  instance_type = "t3.micro"               # Free tier eligible

  user_data = <<-EOF
    #!/bin/bash
    exec > /var/log/user-data.log 2>&1
    set -x
    
    # Install Docker on Amazon Linux 2023
    dnf update -y
    dnf install -y docker git
    systemctl start docker
    systemctl enable docker
    usermod -a -G docker ec2-user
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    # Clone and run the application
    cd /home/ec2-user
    git clone https://github.com/guillelopez22/BookingGrid.git
    cd BookingGrid/fitness-booking
    
    # Create .env file for backend to use RDS  
    cat > backend/.env <<ENVFILE
DATABASE_URL=postgresql://dbadmin:changeme123!@fitness-booking-db.cs7ik8kuqfyp.us-east-1.rds.amazonaws.com:5432/fitness_booking
PORT=3001
NODE_ENV=production
ENVFILE
    
    # Run with docker-compose as root (since we're in user-data)
    /usr/local/bin/docker-compose up -d
  EOF

  tags = {
    Name = "Fitness-Booking-Server"
  }

  # Open necessary ports
  vpc_security_group_ids = [aws_security_group.app.id]
}

# Security group for the application
resource "aws_security_group" "app" {
  name        = "fitness-booking-sg"
  description = "Security group for fitness booking app"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# RDS PostgreSQL database
resource "aws_db_instance" "postgres" {
  identifier     = "fitness-booking-db"
  engine         = "postgres"
  engine_version = "15"
  instance_class = "db.t3.micro"
  
  allocated_storage = 20
  
  db_name  = "fitness_booking"
  username = "dbadmin"
  password = "changeme123!" # In production, use AWS Secrets Manager
  
  skip_final_snapshot = true
  publicly_accessible = true # For simplicity - not recommended for production
}

output "server_ip" {
  value = aws_instance.app_server.public_ip
}

output "database_endpoint" {
  value = aws_db_instance.postgres.endpoint
}