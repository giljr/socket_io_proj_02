import express from 'express';
import { createServer, validateHeaderName } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url'; // Importe fileURLToPath a partir do módulo url
import * as path from 'path'; // Importe o módulo path usando 'import * as'

// Obtenha o caminho do diretório atual do arquivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    res.sendFile(indexPath);
});

io.on('connection', (socket) => {
    socket.on('joinRoom', (data) => {
        const { room, token, offer } = data;
    
        let userData = usersModel.verifyToken(token);
        if (!userData) {
            console.log("No Token or No Room Error :/");
            return;
        }
        if (userData.token.isValid()) {
            socket.join(userData.username);
            console.log('<io># Joining Room: #' + room);
            console.log('<io># User joined with username:', userData.username);
            console.log('<io># Welcome!');
        } else {
            // userData.token.isValid = false;
            console.log(userData.token.isValid());
            // Emit 'invalidToken' with an object containing the username and error
            socket.emit('invalidToken', {
                username: userData.username,
                err: `Invalid Token. User not joined :/`
            });
            return;
        }
    });
    

    socket.on('createOffer', (data) => {
        // Extract offer and token from the received data
        const { offer, token } = data;
            
        // Verify the token first
        const userData = usersModel.verifyToken(data.token);
        if (!userData) {
            console.log('Invalid Token. User not joined :/');
            return; // Do not continue if the token is invalid
        }
        
        // Send the user data (including the username and offer) back to the client
        
        if (userData.token.isValid()) {
            // Handle the createOffer event here
            console.log('<io># Offer created:', offer);
            // You can add your logic to process the offer here
            // Emit 'offerCreated' with an object containing the username and offer
            io.to(userData.username).emit('offerCreated', { username: userData.username, offer: offer });
        }
    });
});

const usersModel = {
    // Function to verify a user's token (for demonstration purposes)
    verifyToken: function(token) {
        // In a real application, you would implement token verification logic here.
        // For this example, let's assume we have a predefined user with a token.
        const predefinedUser = {
            id: 1,
            username: "jaythree",
            // Add a token object with an isValid() function
            token: {
                value: token,
                isValid: function() {
                    // Implement your token validation logic here
                    // For example, you could check the token's expiration date.
                    // Return true if the token is valid, false otherwise.
                    if (this.value === '1000') {
                        return true; // Replace with your actual validation logic
                    } else {
                        return false;
                    }
                }
            },
            role: "provider"
        };

        // For this demonstration, we'll simply return the predefined user.
        return predefinedUser;
    }
};


server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
