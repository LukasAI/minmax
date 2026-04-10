insert into workout_templates (id, name, display_order) values
('upper-1','Upper 1',1),
('lower-1','Lower 1',2),
('upper-2','Upper 2',3),
('lower-2','Lower 2',4),
('arms-delts','Arms + Delts',5)
on conflict do nothing;

insert into exercise_templates (id, workout_template_id, exercise_name, body_part, region_group, default_set_count, display_order) values
('u1-1','upper-1','Barbell Incline Press','chest','upper',2,1),
('u1-2','upper-1','Pec Deck','chest','upper',2,2),
('u1-3','upper-1','Wide Grip Pulldown','lats','upper',2,3),
('l1-1','lower-1','Back Squat','quads','lower',3,1),
('l1-2','lower-1','Romanian Deadlift','hamstrings','lower',2,2),
('u2-1','upper-2','Flat Dumbbell Press','chest','upper',2,1),
('u2-2','upper-2','Chest Supported Row','upper back','upper',2,2),
('l2-1','lower-2','Leg Press','quads','lower',3,1),
('l2-2','lower-2','Seated Leg Curl','hamstrings','lower',2,2),
('a1','arms-delts','EZ Bar Preacher Curl','biceps','upper',2,1),
('a2','arms-delts','Cable Pressdown','triceps','upper',2,2),
('a3','arms-delts','Dumbbell Lateral Raise','shoulders','upper',3,3)
on conflict do nothing;
