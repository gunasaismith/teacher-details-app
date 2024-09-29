// pages/api/teachers.js

import { db } from '../../lib/firebase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const snapshot = await db.collection('teachers').get();
      const teachers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(teachers);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      res.status(500).json({ error: 'Failed to fetch teacher data' });
    }
  } else if (req.method === 'POST') {
    try {
      const newTeachers = req.body; // Expecting an array of teacher objects

      if (!Array.isArray(newTeachers)) {
        res.status(400).json({ error: 'Invalid data format. Expected an array.' });
        return;
      }

      const batch = db.batch();

      newTeachers.forEach(teacher => {
        const docRef = db.collection('teachers').doc(); // Auto-generated ID
        batch.set(docRef, teacher);
      });

      await batch.commit();

      res.status(200).json({ message: 'Teacher data appended successfully' });
    } catch (error) {
      console.error('Error appending teacher data:', error);
      res.status(500).json({ error: 'Failed to append teacher data' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
