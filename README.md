## Getting Started

This project uses Node.js.

1. Install dependencies:

   ```bash
   npm install

# MongoDB Setup for QuickRide

This guide helps you set up MongoDB for the QuickRide application.

## Option 1: Local MongoDB Installation

### Install MongoDB Community Edition

**macOS (using Homebrew):**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Windows:**

1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install using the MSI installer
3. Start MongoDB service

### Verify Installation

```bash
mongosh
# Should connect to MongoDB shell
```

## Option 2: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Replace `<password>` and `<username>` in the connection string
6. Update your `.env` file with the Atlas connection string

## Configuration

1. Copy the environment file:

```bash
cp .env.example .env
```

2. Update the MongoDB URI in `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/quickride
```

## Database Initialization

The application will automatically:

- Connect to MongoDB when the server starts
- Create the `quickride` database
- Initialize with sample users and rides
- Set up proper indexes for performance

## Sample Data

After running the server, you'll have:

**Test Users:**

- Email: `john@example.com`, Password: `password123` (Gold member)
- Email: `sarah@example.com`, Password: `password456` (Silver member)

**Sample Rides:**

- Multiple rides for John with different statuses and ratings
- One ride for Sarah

## Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  dateOfBirth: String,
  address: String,
  joinDate: Date,
  memberLevel: String (Bronze|Silver|Gold|Platinum),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Rides Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  from: String,
  to: String,
  date: Date,
  amount: Number,
  status: String (Completed|Cancelled|In Progress),
  driverName: String,
  rating: Number (1-5),
  paymentMethod: String (Card|Cash|Digital Wallet),
  duration: Number (minutes),
  distance: Number (kilometers),
  createdAt: Date,
  updatedAt: Date
}
```

## Useful MongoDB Commands

**Connect to database:**

```bash
mongosh quickride
```

**View all users:**

```javascript
db.users.find().pretty();
```

**View all rides:**

```javascript
db.rides.find().pretty();
```

**Count documents:**

```javascript
db.users.countDocuments();
db.rides.countDocuments();
```

**Reset database (for development):**

```javascript
db.dropDatabase();
```

## Troubleshooting

**Connection Issues:**

- Make sure MongoDB is running: `brew services list | grep mongodb` (macOS)
- Check the MongoDB URI in `.env`
- Verify MongoDB is listening on port 27017

**Permission Issues:**

- On Linux/macOS, you might need to run with proper permissions
- Check MongoDB log files for detailed error messages

**Atlas Connection Issues:**

- Whitelist your IP address in Atlas Network Access
- Verify username/password in connection string
- Ensure proper URL encoding of special characters
