import boto3
import csv
import uuid
import json
from datetime import datetime
from botocore.exceptions import ClientError

# --- Configuration ---
S3_BUCKET = 'artist-rdv'
CSV_KEY = 'WorksCatalog.csv'
DYNAMO_TABLE = 'prod-DecodedCatalog-decodedmusic-backend'
ARTIST_ID = 'ruedevivre'
ARTIST_PUBLIC_NAME = 'Rue De Vivre'
ARTIST_LEGAL_NAME = 'Avril Hue'

# --- ASCAP Account Details ---
WRITER_COMPOSER_ACCOUNT_ID = '7707873'
PUBLISHER_ACCOUNT_ID = '7707872'
IPI_NAME_NUMBER = '1275926713'
PUBLISHER_NAME = 'AVRIL HUE'

# --- OKINA SAKANA Album Tracks ---
OKINA_SAKANA_TRACKS = {
    'Monday Grind': {
        'rdvId': 'RDV001', 'album': 'Okina Sakana', 'trackNumber': 1, 'bpm': 102,
        'vibe': 'Back-to-work Monday energy', 'genre': 'Caribbean dancehall + EDM',
        'syncCategories': ['Productivity apps', 'coffee/energy-drink spots', 'office-comedy ads']
    },
    'Hump Day': {
        'rdvId': 'RDV002', 'album': 'Okina Sakana', 'trackNumber': 2, 'bpm': 130,
        'vibe': 'Mid-week boost / travel fantasy', 'genre': 'four-on-the-floor synth-pop',
        'tiktokStatus': 'soft-spiking (#HumpDayHustle, 14K+ creations)',
        'syncCategories': ['Fitness campaigns', 'mid-week retail promos', 'airline flash-sales']
    },
    'Friday Flex': {
        'rdvId': 'RDV003', 'album': 'Okina Sakana', 'trackNumber': 3, 'bpm': 135,
        'vibe': 'Payday victory / clock-out party', 'genre': 'electro-hop + bashment',
        'radioStatus': 'early adds on BBC 1Xtra New Dancehall Fire',
        'syncCategories': ['Fashion drops', 'nightlife & spirits', 'ride-share weekend mode']
    },
    'Big Fish': {
        'rdvId': 'RDV004', 'album': 'Okina Sakana', 'trackNumber': 4, 'bpm': 130,
        'vibe': 'Big-league swagger, under-dog wins', 'genre': 'anthemic dancehall',
        'syncCategories': ['Sports broadcasts', 'gaming trailers', 'bold product launches']
    },
    'Weed': {
        'rdvId': 'RDV005', 'album': 'Okina Sakana', 'trackNumber': 5, 'bpm': 145,
        'vibe': 'Herbal chill & wellness pride', 'genre': 'skank-toasting build',
        'syncCategories': ['Cannabis brands', 'herbal supplements', 'eco-lifestyle content']
    },
    '999,999': {
        'rdvId': 'RDV006', 'album': 'Okina Sakana', 'trackNumber': 6, 'bpm': 128,
        'vibe': 'Money moves & side-hustle grind', 'genre': 'Afrobeats-dancehall hustle',
        'syncCategories': ['Fin-tech apps', 'investment platforms', 'luxury streetwear']
    },
    'Shine Every Time': {
        'rdvId': 'RDV007', 'album': 'Okina Sakana', 'trackNumber': 7, 'bpm': 130,
        'vibe': 'Carpe diem / motivational uplift', 'genre': 'EDM/game-anthem drive',
        'syncCategories': ['Sports highlights', 'e-sports hype', 'personal-growth courses']
    },
    'OG Bashment': {
        'rdvId': 'RDV008', 'album': 'Okina Sakana', 'trackNumber': 8, 'bpm': 135,
        'vibe': 'Global block-party celebration', 'genre': 'classic bashment banger',
        'syncCategories': ['Festival teasers', 'beverage brands', 'multicultural events']
    },
    "You're the Shift": {
        'rdvId': 'RDV009', 'album': 'Okina Sakana', 'trackNumber': 9, 'bpm': 137,
        'vibe': 'Gamer power-up / instant action', 'genre': '8-bit + dancehall',
        'releaseStatus': 'unreleased', 'exclusiveStatus': 'first-to-market exclusivity',
        'syncCategories': ['Gaming hardware', 'mobile games', 'Gen-Z tech ads']
    }
}

# --- AZITA NOMADIC NIGHTS Album Tracks ---
AZITA_NOMADIC_NIGHTS_TRACKS = {
    'Fireproof': {
        'rdvId': 'RDV010', 'album': 'Azita Nomadic Nights', 'trackNumber': 1, 'bpm': 145, 'key': 'A minor',
        'vibe': 'Victory, unity, swagger', 'genre': 'Mediterranean-Bollywood-EDM fusion',
        'syncCategories': ['sports win cuts', 'hero product reveals', 'action trailers']
    },
    'Life': {
        'rdvId': 'RDV011', 'album': 'Azita Nomadic Nights', 'trackNumber': 2, 'bpm': 124, 'key': 'E minor',
        'vibe': 'Feel-good optimism', 'genre': 'Mediterranean-Bollywood-EDM fusion',
        'syncCategories': ['retail spring ads', 'social-commerce', 'dance apps']
    },
    'Burn': {
        'rdvId': 'RDV012', 'album': 'Azita Nomadic Nights', 'trackNumber': 3, 'bpm': 128, 'key': 'E minor',
        'vibe': 'Passion, transformation', 'genre': 'Mediterranean-Bollywood-EDM fusion',
        'syncCategories': ['fragrance', 'fashion', 'automotive']
    },
    'Tomorrow': {
        'rdvId': 'RDV013', 'album': 'Azita Nomadic Nights', 'trackNumber': 4, 'bpm': 100, 'key': 'D minor',
        'vibe': 'Hope, fresh start', 'genre': 'Mediterranean-Bollywood-EDM fusion',
        'syncCategories': ['fintech', 'health', 'CSR films']
    },
    'Fire': {
        'rdvId': 'RDV014', 'album': 'Azita Nomadic Nights', 'trackNumber': 5, 'bpm': 130, 'key': 'A minor',
        'vibe': 'Intensity, adrenaline', 'genre': 'Mediterranean-Bollywood-EDM fusion',
        'syncCategories': ['e-sports', 'trailers', 'fitness tech']
    },
    'Click Here': {
        'rdvId': 'RDV015', 'album': 'Azita Nomadic Nights', 'trackNumber': 6, 'bpm': 115, 'key': 'G minor',
        'vibe': 'Digital, playful', 'genre': 'Mediterranean-Bollywood-EDM fusion',
        'syncCategories': ['app launch', 'UX demos', 'influencer unboxings']
    },
    'Quiet': {
        'rdvId': 'RDV016', 'album': 'Azita Nomadic Nights', 'trackNumber': 7, 'bpm': 90, 'key': 'F# minor',
        'vibe': 'Intimate, reflective', 'genre': 'Mediterranean-Bollywood-EDM fusion',
        'syncCategories': ['luxury skincare', 'indie film', 'doc teasers']
    },
    'Late Night': {
        'rdvId': 'RDV017', 'album': 'Azita Nomadic Nights', 'trackNumber': 8, 'bpm': 110, 'key': 'C minor',
        'vibe': 'Seductive, city neon', 'genre': 'Mediterranean-Bollywood-EDM fusion',
        'syncCategories': ['premium spirits', 'nightlife', 'auto EV']
    },
    'Trip': {
        'rdvId': 'RDV018', 'album': 'Azita Nomadic Nights', 'trackNumber': 9, 'bpm': 105, 'key': 'B minor',
        'vibe': 'Adventure, wanderlust', 'genre': 'Mediterranean-Bollywood-EDM fusion',
        'syncCategories': ['travel', 'VR', 'outdoor brands']
    },
    'Zinda Hai Tu': {
        'rdvId': 'RDV019', 'album': 'Azita Nomadic Nights', 'trackNumber': 10, 'bpm': 100, 'key': 'A minor',
        'vibe': 'Inspiration, resilience', 'genre': 'Mediterranean-Bollywood-EDM fusion',
        'syncCategories': ['NGO campaigns', 'sports stories', 'festival trailers']
    },
    'Here I Am': {
        'rdvId': 'RDV020', 'album': 'Azita Nomadic Nights', 'trackNumber': 11, 'bpm': 118, 'key': 'E major',
        'vibe': 'Arrival, self-actualization', 'genre': 'Mediterranean-Bollywood-EDM fusion',
        'syncCategories': ['fashion runway', 'product launch']
    },
    'Cheghad': {
        'rdvId': 'RDV021', 'album': 'Azita Nomadic Nights', 'trackNumber': 12, 'bpm': 95, 'key': 'D minor',
        'vibe': 'Yearning, heritage', 'genre': 'Mediterranean-Bollywood-EDM fusion',
        'syncCategories': ['period drama', 'prestige doc', 'perfume']
    },
    'Geruneh': {
        'rdvId': 'RDV022', 'album': 'Azita Nomadic Nights', 'trackNumber': 13, 'bpm': 85, 'key': 'F minor',
        'vibe': 'Mystery, desert dawn', 'genre': 'Mediterranean-Bollywood-EDM fusion',
        'syncCategories': ['luxury auto', 'travel long-form', 'sci-fi']
    },
    'Kharmaan-e Khatereh': {
        'rdvId': 'RDV023', 'album': 'Azita Nomadic Nights', 'trackNumber': 14, 'bpm': 122, 'key': 'B minor',
        'vibe': 'Bittersweet release', 'genre': 'Mediterranean-Bollywood-EDM fusion',
        'syncCategories': ['drama trailers', 'dance montages', 'fashion']
    }
}

# --- RAVE Album Tracks (High-Energy EDM + Global Club Vibes) ---
RAVE_TRACKS = {
    'No One': {
        'rdvId': 'RDV024', 'album': 'RAVE', 'trackNumber': 1, 'bpm': 126,
        'vibe': 'Digital isolation vs. inner turmoil', 'genre': 'Big-room EDM with orchestral pads',
        'syncCategories': ['reflective scenes', 'mental health spots', 'moody social-media vignettes']
    },
    'New Phone, Who Dis?': {
        'rdvId': 'RDV025', 'album': 'RAVE', 'trackNumber': 2, 'bpm': 128,
        'vibe': 'Fresh start, self-care, and moving on', 'genre': 'Big-room house with sidechain compression',
        'syncCategories': ['fun ads', 'comedic transitions', 'self-empowerment campaigns']
    },
    'Lover': {
        'rdvId': 'RDV026', 'album': 'RAVE', 'trackNumber': 3, 'bpm': 128,
        'vibe': 'Yearning romance, global dancefloor vibes', 'genre': 'Global chant influences with euphoric drops',
        'syncCategories': ['travel/lifestyle', 'romantic comedies', 'uplifting nightclub scenes', 'resort scenes']
    },
    'Brightest Sun (ring tone)': {
        'rdvId': 'RDV027', 'album': 'RAVE', 'trackNumber': 4, 'bpm': 100,
        'vibe': 'Reggae-inspired positivity, spiritual undertones', 'genre': 'Reggae-infused with cinematic builds',
        'syncCategories': ['sunny travel ads', 'feel-good sports montages', 'festival celebrations', 'community celebrations']
    },
    'Be the Lion': {
        'rdvId': 'RDV028', 'album': 'RAVE', 'trackNumber': 5, 'bpm': 128,
        'vibe': 'Courage, leadership, unstoppable determination', 'genre': 'Cinematic orchestral with Dubai club elements',
        'syncCategories': ['action promos', 'sports reels', 'high-energy brand spots', 'fearlessness themes']
    },
    'Lent (Upbeat on the Classic)': {
        'rdvId': 'RDV029', 'album': 'RAVE', 'trackNumber': 6, 'bpm': 130,
        'vibe': 'Modern take on devotion/faith, euphoric big-room elements', 'genre': 'Progressive EDM with sacred motifs',
        'syncCategories': ['dramatic film/TV arcs', 'inspirational trailers', 'emotionally charged brand messages']
    },
    'Not Another MFer': {
        'rdvId': 'RDV030', 'album': 'RAVE', 'trackNumber': 7, 'bpm': 128,
        'vibe': 'Rejecting conformity, standing out, creative freedom', 'genre': 'Anthemic chord progressions with punchy vocals',
        'syncCategories': ['youth culture campaigns', 'rebellious brand statements', 'underdog stories']
    },
    'Boss': {
        'rdvId': 'RDV031', 'album': 'RAVE', 'trackNumber': 8, 'bpm': 120,
        'vibe': 'Triumphant self-mastery; spoken-word & rap fusion', 'genre': 'Chicago-style rap with ethereal female vocals',
        'syncCategories': ['cinematic hero moments', 'transformation arcs', 'motivational brand content', 'sports content']
    },
    'Hold On (Pourquoi...)': {
        'rdvId': 'RDV032', 'album': 'RAVE', 'trackNumber': 9, 'bpm': 90,
        'vibe': 'Overcoming doubt, bilingual faith/hope anthem', 'genre': 'Bilingual emotional build with French elements',
        'syncCategories': ['narrative dramas', 'spiritual journeys', 'cross-cultural campaigns', 'inspirational campaigns']
    }
}

# --- TROIS Album Tracks (Separate from RAVE) ---
TROIS_TRACKS = {
    'California (You Got My One Heart Forever)': {
        'rdvId': 'RDV033', 'album': 'Trois', 'trackNumber': 1, 'bpm': 120,
        'vibe': 'Bright, sun-soaked optimism; West Coast dreams', 'genre': 'Sun-soaked optimistic EDM',
        'syncCategories': ['travel montages', 'lifestyle vignettes', 'upbeat escapism', 'road trip sequences']
    },
    'Perfect': {
        'rdvId': 'RDV034', 'album': 'Trois', 'trackNumber': 2, 'bpm': 95,
        'vibe': 'Soulful resilience; self-love and emotional triumph', 'genre': 'Soulful resilience with emotional depth',
        'syncCategories': ['emotional brand campaigns', 'introspective film scenes', 'celebratory social media', 'self-love content']
    },
    'Shining Star': {
        'rdvId': 'RDV035', 'album': 'Trois', 'trackNumber': 3, 'bpm': 138,
        'vibe': 'Triumphant, feel-good energy; empowerment', 'genre': 'Feel-good empowerment anthem',
        'syncCategories': ['high-octane TV commercials', 'uplifting sports promos', 'cinematic highlight reels', 'empowerment content']
    },
    'Plastic': {
        'rdvId': 'RDV036', 'album': 'Trois', 'trackNumber': 4, 'bpm': 130,
        'vibe': 'Edgy commentary on authenticity vs. superficiality', 'genre': 'Bass-driven attitude with edge',
        'syncCategories': ['fashion-forward adverts', 'youth culture narratives', 'captivating product reveals', 'authenticity themes']
    },
    'Trick': {
        'rdvId': 'RDV037', 'album': 'Trois', 'trackNumber': 5, 'bpm': 125,
        'vibe': 'Funky irreverence, playful call-outs, party vibes', 'genre': 'Funky irreverent party anthem',
        'syncCategories': ['quirky brand spots', 'reality TV transitions', 'comedic film scenes', 'sassy content']
    },
    'Refusnik': {
        'rdvId': 'RDV038', 'album': 'Trois', 'trackNumber': 6, 'bpm': 142,
        'vibe': 'Defiance and determination; standing tall', 'genre': 'Anthemic defiance with determination',
        'syncCategories': ['action-oriented trailers', 'social justice documentaries', 'high-stakes drama', 'boundary-pushing content']
    },
    '405 to the 10': {
        'rdvId': 'RDV039', 'album': 'Trois', 'trackNumber': 7, 'bpm': 115,
        'vibe': 'Road trip nostalgia, urban escapes, travel freedom', 'genre': 'Road trip anthem with urban coastal vibes',
        'syncCategories': ['car commercials', 'cinematic highway scenes', 'breezy lifestyle montages', 'travel freedom content']
    },
    'Ibiza': {
        'rdvId': 'RDV040', 'album': 'Trois', 'trackNumber': 8, 'bpm': 128,
        'vibe': 'Atmospheric club vibe, English/French vocals', 'genre': 'Cosmopolitan dancefloor experience',
        'syncCategories': ['nightlife-centric ads', 'global tourism reels', 'celebratory event recaps', 'stylish edge content']
    }
}

# --- Combined Album Data (4 Albums Total) ---
ALL_ALBUM_TRACKS = {**OKINA_SAKANA_TRACKS, **AZITA_NOMADIC_NIGHTS_TRACKS, **RAVE_TRACKS, **TROIS_TRACKS}

# --- AWS Clients ---
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

def fuzzy_match_track_title(csv_title, album_tracks):
    """Match CSV title to album tracks using fuzzy matching"""
    csv_clean = csv_title.lower().strip().replace('"', '').replace("'", "")
    
    # Direct matches first
    for track_name in album_tracks.keys():
        if track_name.lower() in csv_clean or csv_clean in track_name.lower():
            return track_name
    
    # Partial matches for key terms - Updated with all 4 albums
    partial_matches = {
        # OKINA SAKANA
        'monday': 'Monday Grind', 'hump': 'Hump Day', 'wednesday': 'Hump Day',
        'friday': 'Friday Flex', 'big fish': 'Big Fish', 'okina': 'Big Fish', 'sakana': 'Big Fish',
        'weed': 'Weed', '999': '999,999', 'shine': 'Shine Every Time', 'bashment': 'OG Bashment',
        'shift': "You're the Shift",
        
        # AZITA NOMADIC NIGHTS
        'fireproof': 'Fireproof', 'life': 'Life', 'burn': 'Burn', 'tomorrow': 'Tomorrow', 'fire': 'Fire',
        'click': 'Click Here', 'quiet': 'Quiet', 'late night': 'Late Night', 'trip': 'Trip',
        'zinda': 'Zinda Hai Tu', 'here i am': 'Here I Am', 'cheghad': 'Cheghad', 'geruneh': 'Geruneh',
        'kharmaan': 'Kharmaan-e Khatereh',
        
        # RAVE
        'no one': 'No One', 'new phone': 'New Phone, Who Dis?', 'who dis': 'New Phone, Who Dis?',
        'lover': 'Lover', 'brightest': 'Brightest Sun (ring tone)', 'brightest sun': 'Brightest Sun (ring tone)',
        'be the lion': 'Be the Lion', 'lion': 'Be the Lion', 'lent': 'Lent (Upbeat on the Classic)', 
        'upbeat': 'Lent (Upbeat on the Classic)', 'not another': 'Not Another MFer', 'mfer': 'Not Another MFer',
        'boss': 'Boss', 'hold on': 'Hold On (Pourquoi...)', 'pourquoi': 'Hold On (Pourquoi...)',
        
        # TROIS
        'california': 'California (You Got My One Heart Forever)', 'perfect': 'Perfect',
        'shining star': 'Shining Star', 'plastic': 'Plastic', 'trick': 'Trick', 'refusnik': 'Refusnik',
        '405': '405 to the 10', 'ibiza': 'Ibiza'
    }
    
    for key, track_name in partial_matches.items():
        if key in csv_clean:
            return track_name
    
    return None

def clear_existing_works():
    """Clear existing works to prevent duplicates"""
    print("🧹 Clearing existing works...")
    try:
        table = dynamodb.Table(DYNAMO_TABLE)
        
        response = table.scan(
            FilterExpression='artistId = :aid AND #type = :type',
            ExpressionAttributeNames={'#type': 'type'},
            ExpressionAttributeValues={':aid': ARTIST_ID, ':type': 'work'}
        )
        
        for work in response['Items']:
            table.delete_item(Key={'id': work['id']})
        
        print(f"✅ Cleared {len(response['Items'])} existing works")
        return True
    except Exception as e:
        print(f"❌ Error clearing works: {e}")
        return False

def verify_s3_bucket():
    """Verify S3 bucket exists and is accessible"""
    print(f"🪣 Verifying S3 bucket: {S3_BUCKET}")
    try:
        s3.head_bucket(Bucket=S3_BUCKET)
        print(f"✅ S3 bucket accessible")
        return True
    except ClientError as e:
        print(f"❌ S3 bucket error: {e}")
        return False

def verify_csv_file():
    """Verify CSV file exists"""
    print(f"📄 Verifying CSV file: {CSV_KEY}")
    try:
        s3.head_object(Bucket=S3_BUCKET, Key=CSV_KEY)
        print(f"✅ CSV file found")
        return True
    except ClientError as e:
        print(f"❌ CSV file error: {e}")
        return False

def verify_dynamodb_table():
    """Verify DynamoDB table exists"""
    print(f"🗄️ Verifying DynamoDB table: {DYNAMO_TABLE}")
    try:
        table = dynamodb.Table(DYNAMO_TABLE)
        table.load()
        print(f"✅ DynamoDB table exists")
        return table
    except ClientError as e:
        print(f"❌ DynamoDB error: {e}")
        return None

def analyze_csv_for_albums():
    """Analyze CSV and match to album tracks"""
    print("🔍 Analyzing CSV for album matches...")
    try:
        obj = s3.get_object(Bucket=S3_BUCKET, Key=CSV_KEY)
        lines = obj['Body'].read().decode('utf-8').splitlines()
        reader = csv.DictReader(lines)
        
        # Group by title to eliminate duplicates
        works_by_title = {}
        for row in reader:
            title = row.get('Title', row.get('Work Title', 'Unknown'))
            if title not in works_by_title:
                works_by_title[title] = []
            works_by_title[title].append(row)
        
        # Match to album tracks
        matched_tracks = {}
        unmatched_works = []
        
        for csv_title, entries in works_by_title.items():
            matched_track = fuzzy_match_track_title(csv_title, ALL_ALBUM_TRACKS)
            if matched_track:
                matched_tracks[matched_track] = {
                    'csvTitle': csv_title,
                    'entries': entries,
                    'trackMeta': ALL_ALBUM_TRACKS[matched_track]
                }
            else:
                unmatched_works.append(csv_title)
        
        print(f"📊 Analysis Results:")
        print(f"   Total unique works: {len(works_by_title)}")
        print(f"   Album track matches: {len(matched_tracks)}")
        print(f"   🥁 OKINA SAKANA matches: {len([t for t in matched_tracks.values() if t['trackMeta']['album'] == 'Okina Sakana'])}")
        print(f"   🌙 AZITA matches: {len([t for t in matched_tracks.values() if t['trackMeta']['album'] == 'Azita Nomadic Nights'])}")
        print(f"   🔥 RAVE matches: {len([t for t in matched_tracks.values() if t['trackMeta']['album'] == 'RAVE'])}")
        print(f"   🎧 TROIS matches: {len([t for t in matched_tracks.values() if t['trackMeta']['album'] == 'Trois'])}")
        print(f"   ❓ Unmatched: {len(unmatched_works)}")
        
        return matched_tracks, unmatched_works
        
    except Exception as e:
        print(f"❌ Error analyzing CSV: {e}")
        return {}, []

def consolidate_work_data(work_entries):
    """Consolidate multiple ASCAP entries"""
    if not work_entries:
        return None
    
    base_work = work_entries[0].copy()
    
    roles = []
    writer_share = 0
    publisher_share = 0
    
    for entry in work_entries:
        role = entry.get('Role', entry.get('Capacity', 'Unknown'))
        share = entry.get('Share', entry.get('Ownership %', '0'))
        
        try:
            share_value = float(share.replace('%', '')) if isinstance(share, str) else float(share)
        except:
            share_value = 0
        
        roles.append(role)
        
        if 'writer' in role.lower() or 'composer' in role.lower():
            writer_share += share_value
        elif 'publisher' in role.lower():
            publisher_share += share_value
    
    base_work.update({
        'roles': list(set(roles)),
        'writerShare': f"{writer_share}%",
        'publisherShare': f"{publisher_share}%",
        'totalEntries': len(work_entries)
    })
    
    return base_work

def create_artist_record():
    """Create artist record with album metadata"""
    print(f"👤 Creating artist record...")
    try:
        table = dynamodb.Table(DYNAMO_TABLE)
        artist_item = {
            'id': ARTIST_ID,
            'type': 'artist',
            'publicName': ARTIST_PUBLIC_NAME,
            'legalName': ARTIST_LEGAL_NAME,
            'ascapMember': True,
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat(),
            'ascapDetails': {
                'writerComposerAccountId': WRITER_COMPOSER_ACCOUNT_ID,
                'publisherAccountId': PUBLISHER_ACCOUNT_ID,
                'ipiNameNumber': IPI_NAME_NUMBER,
                'publisherName': PUBLISHER_NAME
            },
            'albumography': {
                'totalAlbums': 4,
                'albums': [
                    {'name': 'Okina Sakana', 'tracks': 9, 'style': 'Caribbean dancehall + EDM + Afrobeats'},
                    {'name': 'Azita Nomadic Nights', 'tracks': 14, 'style': 'Mediterranean-Bollywood-EDM fusion'},
                    {'name': 'RAVE', 'tracks': 9, 'style': 'High-energy EDM + global club vibes + orchestral mastering'},
                    {'name': 'Trois', 'tracks': 8, 'style': 'Diverse EDM styles + emotional range'}
                ]
            }
        }
        
        table.put_item(Item=artist_item)
        print(f"✅ Artist record created")
        return True
    except Exception as e:
        print(f"❌ Error creating artist: {e}")
        return False

def load_album_works(matched_tracks, unmatched_works):
    """Load album works with comprehensive metadata"""
    print("💿 Loading album works...")
    
    try:
        table = dynamodb.Table(DYNAMO_TABLE)
        works_loaded = 0
        errors = 0
        
        # Load matched album tracks
        for track_name, track_data in matched_tracks.items():
            try:
                consolidated_work = consolidate_work_data(track_data['entries'])
                if not consolidated_work:
                    continue
                
                track_meta = track_data['trackMeta']
                
                work_item = {
                    'id': str(uuid.uuid4()),
                    'rdvId': track_meta['rdvId'],
                    'type': 'work',
                    'artistId': ARTIST_ID,
                    'artistName': ARTIST_PUBLIC_NAME,
                    'source': 'ASCAP',
                    'title': track_name,
                    'csvTitle': track_data['csvTitle'],
                    'createdAt': datetime.utcnow().isoformat(),
                    'updatedAt': datetime.utcnow().isoformat(),
                    'consolidated': True,
                    'albumTrack': True
                }
                
                # Album info
                work_item['albumInfo'] = {
                    'album': track_meta['album'],
                    'trackNumber': track_meta['trackNumber'],
                    'releaseStatus': track_meta.get('releaseStatus', 'released')
                }
                
                # Musical metadata
                work_item['musicalMetadata'] = {
                    'bpm': track_meta['bpm'],
                    'key': track_meta.get('key', ''),
                    'genre': track_meta['genre'],
                    'vibe': track_meta['vibe']
                }
                
                # Sync metadata
                work_item['syncMetadata'] = {
                    'syncCategories': track_meta['syncCategories'],
                    'energyLevel': 'High' if track_meta['bpm'] > 120 else 'Medium' if track_meta['bpm'] > 90 else 'Low'
                }
                
                # Special statuses
                if 'tiktokStatus' in track_meta:
                    work_item['socialMediaMetrics'] = {'tiktokStatus': track_meta['tiktokStatus']}
                if 'radioStatus' in track_meta:
                    work_item['radioStatus'] = track_meta['radioStatus']
                if 'exclusiveStatus' in track_meta:
                    work_item['exclusiveStatus'] = track_meta['exclusiveStatus']
                
                # ASCAP identifiers
                work_item['ascapIdentifiers'] = {
                    'workId': consolidated_work.get('Work ID', ''),
                    'iswc': consolidated_work.get('ISWC', ''),
                    'registrationDate': consolidated_work.get('Registration Date', ''),
                    'writerComposerAccountId': WRITER_COMPOSER_ACCOUNT_ID,
                    'publisherAccountId': PUBLISHER_ACCOUNT_ID
                }
                
                # Ownership
                work_item['ownership'] = {
                    'roles': consolidated_work.get('roles', []),
                    'writerShare': consolidated_work.get('writerShare', '0%'),
                    'publisherShare': consolidated_work.get('publisherShare', '0%')
                }
                
                # Streaming platforms
                work_item['streamingPlatforms'] = {
                    'spotify': False,
                    'youtube': False,
                    'appleMusic': False,
                    'needsLinking': True
                }
                
                # Add other CSV fields
                for key, value in consolidated_work.items():
                    if key not in ['roles', 'writerShare', 'publisherShare', 'totalEntries'] and value and str(value).strip():
                        clean_key = key.replace(' ', '_').replace('-', '_').replace('(', '').replace(')', '')
                        work_item[clean_key] = str(value).strip()
                
                table.put_item(Item=work_item)
                works_loaded += 1
                
                # Album-specific emoji
                album_emoji = '🥁' if track_meta['album'] == 'Okina Sakana' else '🌙' if track_meta['album'] == 'Azita Nomadic Nights' else '🔥' if track_meta['album'] == 'RAVE' else '🎧'
                print(f"    {album_emoji} {track_meta['rdvId']}: {track_name}")
                
            except Exception as e:
                print(f"  ❌ Error loading {track_name}: {e}")
                errors += 1
        
        print(f"\n📊 Album loading completed:")
        print(f"   ✅ Album tracks loaded: {works_loaded}")
        print(f"   ❌ Errors: {errors}")
        
        return works_loaded, errors
        
    except Exception as e:
        print(f"❌ Error loading works: {e}")
        return 0, 1

def verify_album_catalog():
    """Verify album catalog structure"""
    print("🔍 Verifying album catalog...")
    try:
        table = dynamodb.Table(DYNAMO_TABLE)
        
        response = table.scan(
            FilterExpression='artistId = :aid AND albumTrack = :album',
            ExpressionAttributeValues={':aid': ARTIST_ID, ':album': True}
        )
        
        album_tracks = response['Items']
        
        # Group by album
        okina_tracks = [t for t in album_tracks if t.get('albumInfo', {}).get('album') == 'Okina Sakana']
        azita_tracks = [t for t in album_tracks if t.get('albumInfo', {}).get('album') == 'Azita Nomadic Nights']
        rave_tracks = [t for t in album_tracks if t.get('albumInfo', {}).get('album') == 'RAVE']
        trois_tracks = [t for t in album_tracks if t.get('albumInfo', {}).get('album') == 'Trois']
        
        print(f"📊 Album tracks verified:")
        print(f"   🥁 OKINA SAKANA: {len(okina_tracks)} tracks")
        print(f"   🌙 AZITA NOMADIC NIGHTS: {len(azita_tracks)} tracks")
        print(f"   🔥 RAVE: {len(rave_tracks)} tracks")
        print(f"   🎧 TROIS: {len(trois_tracks)} tracks")
        print(f"   📀 Total album tracks: {len(album_tracks)}")
        
        return len(album_tracks)
        
    except Exception as e:
        print(f"❌ Error verifying catalog: {e}")
        return 0

def main():
    """Main execution function"""
    print("🎧 COMPLETE ALBUM CATALOG LOADER")
    print("🎵 4 ALBUMS: OKINA SAKANA + AZITA + RAVE + TROIS")
    print("=" * 70)
    
    print("📀 Albums to load:")
    print("    🥁 OKINA SAKANA (9 tracks): Caribbean dancehall + EDM + Afrobeats")
    print("    🌙 AZITA NOMADIC NIGHTS (14 tracks): Mediterranean-Bollywood-EDM fusion")
    print("    🔥 RAVE (9 tracks): High-energy EDM + global club vibes + orchestral mastering")
    print("    🎧 TROIS (8 tracks): Diverse EDM styles + emotional range")
    print(f"    📊 Total: 40 tracks across 4 albums")
    
    # Verify setup
    if not verify_s3_bucket() or not verify_csv_file():
        return
    
    table = verify_dynamodb_table()
    if not table:
        return
    
    # Analyze CSV
    matched_tracks, unmatched_works = analyze_csv_for_albums()
    if not matched_tracks:
        print("❌ No album tracks found in CSV")
        return
    
    # Confirm
    print(f"\n🚀 Ready to load complete album catalog:")
    print(f"    🎵 Album tracks matched: {len(matched_tracks)}")
    print(f"    📊 Comprehensive sync metadata included")
    print(f"    🎯 BPM range: 85-145")
    print(f"    🌍 Global sync categories included")
    
    confirm = input("\nProceed with complete album loading? (y/N): ").lower().strip()
    if confirm != 'y':
        print("❌ Operation cancelled")
        return
    
    # Load data
    if not clear_existing_works():
        return
    
    if not create_artist_record():
        return
    
    works_loaded, errors = load_album_works(matched_tracks, unmatched_works)
    if works_loaded == 0:
        return
    
    # Verify
    final_count = verify_album_catalog()
    
    print("\n" + "=" * 70)
    print("🎉 COMPLETE ALBUM CATALOG LOADING COMPLETE!")
    print(f"   🎵 Album tracks loaded: {works_loaded}")
    print(f"   ❌ Errors: {errors}")
    print(f"   📀 Total catalog: {final_count} tracks")
    print(f"   📊 Coverage: 4 albums spanning diverse EDM/global styles")
    
    print(f"\n🚀 Next steps:")
    print(f"   1. 🔗 Run spotify-auto-linker.py")
    print(f"   2. 📊 Run enhanced-spotify-insights.py")
    print(f"   3. 📈 Run growth-dashboard.py")
    print(f"   4. 🎥 Add YouTube and Apple Music links")

if __name__ == "__main__":
    main()
